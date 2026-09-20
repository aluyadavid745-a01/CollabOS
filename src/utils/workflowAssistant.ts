import type { LocalProject } from './localProjects'
import type { LocalTask } from './localTasks'
import type { LocalActivityItem } from './localActivity'
import type { LocalCalendarEvent, LocalFileRecord, LocalMessage, LocalTeamMember } from './localWorkspace'

export type WorkflowIntent = 'plan' | 'triage' | 'summary' | 'blockers' | 'meeting' | 'files' | 'team' | 'unknown'

export interface WorkflowSnapshot {
  projects: LocalProject[]
  tasks: LocalTask[]
  messages: LocalMessage[]
  events: LocalCalendarEvent[]
  files: LocalFileRecord[]
  teamMembers: LocalTeamMember[]
  activity: LocalActivityItem[]
}

export interface WorkflowInsight {
  intent: WorkflowIntent
  title: string
  answer: string
  contextUsed: string[]
  nextSteps: Array<{
    label: string
    route: string
  }>
  draftTasks: Array<{
    title: string
    owner: string
    priority: LocalTask['priority']
    projectId?: string
  }>
}

const todayKey = () => new Date().toISOString().slice(0, 10)

const includesAny = (value: string, words: string[]) => words.some((word) => value.includes(word))

export const detectWorkflowIntent = (prompt: string): WorkflowIntent => {
  const lower = prompt.toLowerCase()

  if (includesAny(lower, ['create', 'plan', 'launch', 'build']) && includesAny(lower, ['project', 'campaign', 'workflow', 'sprint'])) return 'plan'
  if (includesAny(lower, ['today', 'priority', 'priorities', 'focus', 'next', 'triage'])) return 'triage'
  if (includesAny(lower, ['summarize', 'summary', 'recap', 'status', 'what happened'])) return 'summary'
  if (includesAny(lower, ['blocker', 'blocked', 'risk', 'stuck', 'late', 'overdue'])) return 'blockers'
  if (includesAny(lower, ['meeting', 'calendar', 'schedule', 'kickoff', 'sync'])) return 'meeting'
  if (includesAny(lower, ['file', 'document', 'brief', 'deck', 'asset'])) return 'files'
  if (includesAny(lower, ['team', 'owner', 'assign', 'invite', 'workload'])) return 'team'

  return 'unknown'
}

export const buildWorkflowInsight = (prompt: string, ownerName: string, snapshot: WorkflowSnapshot): WorkflowInsight => {
  const intent = detectWorkflowIntent(prompt)
  const openTasks = snapshot.tasks.filter((task) => !task.done)
  const today = todayKey()
  const dueToday = openTasks.filter((task) => task.dueAt.slice(0, 10) <= today)
  const latestProject = snapshot.projects[0]
  const latestProjectTasks = latestProject ? snapshot.tasks.filter((task) => task.projectId === latestProject.id) : []
  const blockedTasks = openTasks.filter((task) => {
    const value = `${task.title} ${task.description} ${task.priority}`.toLowerCase()
    return task.priority === 'High' || includesAny(value, ['block', 'stuck', 'risk', 'late', 'urgent'])
  })
  const activeOwners = Array.from(new Set(openTasks.map((task) => task.owner).filter(Boolean)))
  const contextUsed = [
    `${snapshot.projects.length} project${snapshot.projects.length === 1 ? '' : 's'}`,
    `${openTasks.length} open task${openTasks.length === 1 ? '' : 's'}`,
    `${snapshot.messages.length} message${snapshot.messages.length === 1 ? '' : 's'}`,
    `${snapshot.events.length} calendar item${snapshot.events.length === 1 ? '' : 's'}`,
    `${snapshot.files.length} file${snapshot.files.length === 1 ? '' : 's'}`,
    `${snapshot.teamMembers.length} teammate${snapshot.teamMembers.length === 1 ? '' : 's'}`,
  ]

  if (intent === 'plan') {
    return {
      intent,
      title: 'Project workflow prepared',
      answer: latestProject
        ? `I can turn this into a connected workflow and attach it to ${latestProject.name}, or create a fresh project plan for approval.`
        : 'I can create a project workflow with tasks, owners, kickoff meeting, launch brief, and a team update after you approve it.',
      contextUsed,
      nextSteps: [
        { label: 'Review project plan', route: '/projects' },
        { label: 'Check task board', route: '/tasks' },
      ],
      draftTasks: [
        { title: 'Define scope and success metrics', owner: ownerName, priority: 'High', projectId: latestProject?.id },
        { title: 'Assign owners and timeline', owner: ownerName, priority: 'High', projectId: latestProject?.id },
        { title: 'Prepare launch assets and review checklist', owner: ownerName, priority: 'Medium', projectId: latestProject?.id },
      ],
    }
  }

  if (intent === 'triage') {
    const focus = dueToday.length ? dueToday : openTasks.slice(0, 3)
    return {
      intent,
      title: 'Today’s workflow focus',
      answer: focus.length
        ? `Start with ${focus.map((task) => `"${task.title}"`).join(', ')}. ${blockedTasks.length ? `${blockedTasks.length} high-risk task${blockedTasks.length === 1 ? '' : 's'} need attention.` : 'No high-risk task is obvious from the current workspace.'}`
        : 'There are no open tasks yet. Create a project workflow or add a first task before triage can be useful.',
      contextUsed,
      nextSteps: [
        { label: 'Open tasks', route: '/tasks' },
        { label: 'Open dashboard', route: '/home' },
      ],
      draftTasks: focus.length ? [] : [{ title: 'Create first workflow task', owner: ownerName, priority: 'Medium' }],
    }
  }

  if (intent === 'summary') {
    return {
      intent,
      title: latestProject ? `${latestProject.name} summary` : 'Workspace summary',
      answer: latestProject
        ? `${latestProject.name} has ${latestProjectTasks.length} linked task${latestProjectTasks.length === 1 ? '' : 's'}, ${snapshot.messages.length} workspace message${snapshot.messages.length === 1 ? '' : 's'}, ${snapshot.events.length} calendar item${snapshot.events.length === 1 ? '' : 's'}, and ${snapshot.files.length} file${snapshot.files.length === 1 ? '' : 's'}.`
        : 'There is no project yet. I can still see workspace counts, but a project gives the assistant a workflow anchor.',
      contextUsed,
      nextSteps: [
        { label: 'Open projects', route: '/projects' },
        { label: 'Open activity', route: '/notifications' },
      ],
      draftTasks: [],
    }
  }

  if (intent === 'blockers') {
    return {
      intent,
      title: 'Workflow risks',
      answer: blockedTasks.length
        ? `The likely blockers are ${blockedTasks.slice(0, 4).map((task) => `"${task.title}"`).join(', ')}. Confirm ownership and unblock the highest priority item first.`
        : 'No blocker is explicitly visible. I checked high-priority and risk-like task text, but the team should tag blocked work clearly.',
      contextUsed,
      nextSteps: [
        { label: 'Review tasks', route: '/tasks' },
        { label: 'Message team', route: '/messages' },
      ],
      draftTasks: blockedTasks.length
        ? [{ title: `Unblock ${blockedTasks[0].title}`, owner: blockedTasks[0].owner || ownerName, priority: 'High', projectId: blockedTasks[0].projectId }]
        : [{ title: 'Confirm blockers with project owners', owner: ownerName, priority: 'High', projectId: latestProject?.id }],
    }
  }

  if (intent === 'meeting') {
    return {
      intent,
      title: 'Meeting workflow',
      answer: snapshot.events.length
        ? `You have ${snapshot.events.length} meeting or calendar item${snapshot.events.length === 1 ? '' : 's'}. Use the next meeting to review owners, blockers, and decisions.`
        : 'No meeting is scheduled. Prepare a kickoff or blocker review tied to the active project.',
      contextUsed,
      nextSteps: [
        { label: 'Open calendar', route: '/calendar' },
        { label: 'Open meetings', route: '/meetings' },
      ],
      draftTasks: [{ title: 'Prepare meeting agenda and decisions list', owner: ownerName, priority: 'Medium', projectId: latestProject?.id }],
    }
  }

  if (intent === 'files') {
    return {
      intent,
      title: 'File workflow',
      answer: snapshot.files.length
        ? `There are ${snapshot.files.length} saved file${snapshot.files.length === 1 ? '' : 's'}. Make sure the active project has a brief, checklist, and final assets attached.`
        : 'No files are saved yet. The workflow needs a brief or checklist so decisions are not trapped in chat.',
      contextUsed,
      nextSteps: [
        { label: 'Open files', route: '/files' },
        { label: 'Open latest project', route: '/projects' },
      ],
      draftTasks: [{ title: 'Create project brief and asset checklist', owner: ownerName, priority: 'Medium', projectId: latestProject?.id }],
    }
  }

  if (intent === 'team') {
    return {
      intent,
      title: 'Team workflow',
      answer: activeOwners.length
        ? `Current open work is owned by ${activeOwners.slice(0, 5).join(', ')}. Check workload before assigning more tasks.`
        : 'No task owners are active yet. Invite the team or assign the first workflow tasks.',
      contextUsed,
      nextSteps: [
        { label: 'Open team', route: '/team' },
        { label: 'Open tasks', route: '/tasks' },
      ],
      draftTasks: [{ title: 'Confirm task owners and responsibilities', owner: ownerName, priority: 'High', projectId: latestProject?.id }],
    }
  }

  return {
    intent,
    title: 'Workflow assistant ready',
    answer: 'I can plan a project, triage today, summarize current work, identify blockers, prepare meetings, organize files, or check team ownership from your workspace context.',
    contextUsed,
    nextSteps: [
      { label: 'Open dashboard', route: '/home' },
      { label: 'Open projects', route: '/projects' },
    ],
    draftTasks: [],
  }
}
