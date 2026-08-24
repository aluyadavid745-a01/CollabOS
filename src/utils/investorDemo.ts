import { createLocalProject, readLocalProjects, writeLocalProjects } from './localProjects'
import { createLocalTask, readLocalTasks, writeLocalTasks } from './localTasks'
import {
  createLocalCalendarEvent,
  createLocalFileRecord,
  createLocalMessage,
  createLocalTeamMember,
  readLocalCalendarEvents,
  readLocalFiles,
  readLocalMessages,
  readLocalTeamMembers,
  writeLocalCalendarEvents,
  writeLocalFiles,
  writeLocalMessages,
  writeLocalTeamMembers,
} from './localWorkspace'
import { recordLocalActivity } from './localActivity'
import { syncBeginnerWorkspaceToCloud } from './beginnerWorkspaceSync'

const daysFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export interface AiLaunchPlanPreview {
  projectName: string
  description: string
  members: string[]
  deadline: string
  milestones: string[]
  tasks: Array<{
    title: string
    owner: string
    dueAt: string
    priority: 'Low' | 'Medium' | 'High'
  }>
  meetingTitle: string
  fileName: string
  message: string
}

export const buildAiLaunchPlanPreview = (prompt: string, ownerName: string): AiLaunchPlanPreview => {
  const cleanPrompt = prompt.trim() || 'Launch our new product'
  const projectName = cleanPrompt
    .replace(/^create\s+/i, '')
    .replace(/^plan\s+/i, '')
    .replace(/\.$/, '')

  return {
    projectName,
    description: `AI-prepared launch plan for: ${cleanPrompt}`,
    members: [ownerName, 'Product Lead', 'Designer', 'Developer'],
    deadline: daysFromNow(21),
    milestones: ['Define launch scope', 'Build launch assets', 'Test the complete flow', 'Launch and review'],
    tasks: [
      'Define launch goals and success metrics',
      'Create landing page copy and visuals',
      'Prepare announcement message',
      'Test product flow end to end',
      'Review launch checklist with team',
    ].map((title, index) => ({
      title,
      owner: index === 0 ? ownerName : ['Product Lead', 'Designer', 'Developer', ownerName][index - 1] || ownerName,
      dueAt: daysFromNow(index + 2),
      priority: index < 2 ? 'High' : 'Medium',
    })),
    meetingTitle: `${projectName} kickoff`,
    fileName: `${projectName} launch brief`,
    message: `AI prepared a launch plan for ${projectName}. Review the tasks and kickoff meeting.`,
  }
}

export const createAiLaunchPlan = (prompt: string, ownerName: string) => {
  const preview = buildAiLaunchPlanPreview(prompt, ownerName)
  const project = createLocalProject({
    name: preview.projectName,
    description: preview.description.replace('AI-prepared', 'AI-approved'),
    members: preview.members.join(', '),
    deadline: preview.deadline,
    status: 'Active',
  })

  const tasks = preview.tasks.map((task) =>
    createLocalTask({
      title: task.title,
      owner: task.owner,
      dueAt: task.dueAt,
      priority: task.priority,
      projectId: project.id,
    })
  )

  const meeting = createLocalCalendarEvent({
    title: preview.meetingTitle,
    date: daysFromNow(1),
    time: '10:00',
    projectId: project.id,
  })

  const file = createLocalFileRecord({
    name: preview.fileName,
    type: 'Document',
    owner: ownerName,
    projectId: project.id,
  })

  const message = createLocalMessage({
    text: preview.message.replace('prepared', 'created'),
    sender: 'CollabOS AI',
    projectId: project.id,
  })

  writeLocalProjects([project, ...readLocalProjects()])
  writeLocalTasks([...tasks, ...readLocalTasks()])
  writeLocalCalendarEvents([meeting, ...readLocalCalendarEvents()])
  writeLocalFiles([file, ...readLocalFiles()])
  writeLocalMessages([message, ...readLocalMessages()])
  recordLocalActivity({ type: 'ai', title: 'AI project plan created', detail: project.name, route: '/projects' })
  void syncBeginnerWorkspaceToCloud()

  return project
}

export const loadSampleWorkspace = (ownerName: string) => {
  const team = [
    createLocalTeamMember({ name: ownerName, email: '', role: 'Founder' }),
    createLocalTeamMember({ name: 'Sarah Lee', email: 'sarah@sample.co', role: 'Designer' }),
    createLocalTeamMember({ name: 'Alex Morgan', email: 'alex@sample.co', role: 'Developer' }),
  ]

  const project = createLocalProject({
    name: 'Investor Demo Launch',
    description: 'A polished sample workspace showing projects, tasks, messages, files, meetings, and team activity.',
    members: team.map((member) => member.name).join(', '),
    deadline: daysFromNow(14),
    status: 'Active',
  })

  const tasks = [
    createLocalTask({ title: 'Finalize pitch deck outline', owner: ownerName, dueAt: daysFromNow(1), priority: 'High', projectId: project.id }),
    createLocalTask({ title: 'Design product demo screens', owner: 'Sarah Lee', dueAt: daysFromNow(3), priority: 'High', projectId: project.id }),
    createLocalTask({ title: 'Test onboarding flow', owner: 'Alex Morgan', dueAt: daysFromNow(5), priority: 'Medium', projectId: project.id }),
    createLocalTask({ title: 'Prepare investor Q&A notes', owner: ownerName, dueAt: daysFromNow(7), priority: 'Medium', projectId: project.id }),
  ]

  const messages = [
    createLocalMessage({ text: 'Demo workspace loaded. The investor flow is ready to review.', sender: 'CollabOS AI', projectId: project.id }),
    createLocalMessage({ text: 'I will polish the project screens before the demo.', sender: 'Sarah Lee', projectId: project.id }),
  ]

  const events = [
    createLocalCalendarEvent({ title: 'Investor demo rehearsal', date: daysFromNow(2), time: '11:00', projectId: project.id }),
    createLocalCalendarEvent({ title: 'Launch readiness review', date: daysFromNow(6), time: '15:00', projectId: project.id }),
  ]

  const files = [
    createLocalFileRecord({ name: 'Pitch deck outline', type: 'Presentation', owner: ownerName, projectId: project.id }),
    createLocalFileRecord({ name: 'Demo checklist', type: 'Document', owner: 'CollabOS AI', projectId: project.id }),
  ]

  writeLocalTeamMembers([...team, ...readLocalTeamMembers()])
  writeLocalProjects([project, ...readLocalProjects()])
  writeLocalTasks([...tasks, ...readLocalTasks()])
  writeLocalMessages([...messages, ...readLocalMessages()])
  writeLocalCalendarEvents([...events, ...readLocalCalendarEvents()])
  writeLocalFiles([...files, ...readLocalFiles()])
  recordLocalActivity({ type: 'ai', title: 'Sample workspace loaded', detail: 'Investor Demo Launch is ready', route: '/home' })
  void syncBeginnerWorkspaceToCloud()

  return project
}
