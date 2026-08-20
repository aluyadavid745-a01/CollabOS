import {
  Bot,
  CheckSquare,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react'

export const featureDetails = [
  {
    id: 1,
    slug: 'instant-messaging',
    icon: MessageSquare,
    title: 'Instant Messaging',
    eyebrow: 'Real-time communication',
    description: 'Real-time team communication with threads, reactions, and rich media support',
    color: 'from-blue-600 to-cyan-600',
    hero:
      'Bring every project conversation into focused team channels with fast messaging, searchable context, and media-rich collaboration.',
    highlights: [
      'Dedicated channels for teams, projects, and workspaces',
      'Threaded replies that keep side discussions organized',
      'Reactions, mentions, and file previews for faster feedback',
      'Searchable message history so teammates can recover context quickly',
    ],
    workflow: ['Create a channel', 'Invite collaborators', 'Share updates', 'Resolve decisions'],
    stats: [
      { label: 'Message sync', value: 'Real-time' },
      { label: 'Context', value: 'Searchable' },
      { label: 'Media', value: 'Rich previews' },
    ],
  },
  {
    id: 2,
    slug: 'task-management',
    icon: CheckSquare,
    title: 'Task Management',
    eyebrow: 'Organized execution',
    description: 'Organize work with smart lists, kanban boards, and automated workflows',
    color: 'from-purple-600 to-pink-600',
    hero:
      'Turn team conversations into clear execution with boards, ownership, due dates, and progress views built for collaboration.',
    highlights: [
      'Kanban boards for planning and delivery',
      'Assignees, priorities, and due dates for accountability',
      'Smart task lists that keep project work visible',
      'Workflow automation for repeated team processes',
    ],
    workflow: ['Capture work', 'Assign owners', 'Track progress', 'Ship outcomes'],
    stats: [
      { label: 'Views', value: 'List + board' },
      { label: 'Ownership', value: 'Clear' },
      { label: 'Automation', value: 'Built in' },
    ],
  },
  {
    id: 3,
    slug: 'document-collaboration',
    icon: FileText,
    title: 'Document Collaboration',
    eyebrow: 'Shared knowledge',
    description: 'Create, edit, and share documents with real-time collaboration features',
    color: 'from-emerald-600 to-teal-600',
    hero:
      'Create living documents for specs, meeting notes, decisions, and team knowledge without losing collaboration context.',
    highlights: [
      'Shared docs connected to projects and teams',
      'Real-time editing for collaborative writing',
      'Comments and review flows for async feedback',
      'Centralized knowledge that stays easy to find',
    ],
    workflow: ['Draft docs', 'Invite editors', 'Review changes', 'Publish knowledge'],
    stats: [
      { label: 'Editing', value: 'Collaborative' },
      { label: 'Review', value: 'Commented' },
      { label: 'Knowledge', value: 'Centralized' },
    ],
  },
  {
    id: 4,
    slug: 'video-meetings',
    icon: Video,
    title: 'Video Meetings',
    eyebrow: 'Live collaboration',
    description: 'HD video conferencing with screen sharing and recording capabilities',
    color: 'from-rose-600 to-orange-600',
    hero:
      'Move from async discussion to live problem-solving with meetings designed for teams that need decisions and momentum.',
    highlights: [
      'HD meetings for team standups, reviews, and planning',
      'Screen sharing for demos and design walkthroughs',
      'Recording support for teammates who cannot attend live',
      'Meeting context connected back to workspace activity',
    ],
    workflow: ['Start meeting', 'Share screen', 'Capture notes', 'Follow up'],
    stats: [
      { label: 'Quality', value: 'HD' },
      { label: 'Sharing', value: 'Screen' },
      { label: 'Follow-up', value: 'Recorded' },
    ],
  },
  {
    id: 5,
    slug: 'ai-assistant',
    icon: Zap,
    title: 'AI Assistant',
    eyebrow: 'Smarter teamwork',
    description: 'Smart AI that summarizes conversations and suggests actionable insights',
    color: 'from-yellow-600 to-amber-600',
    hero:
      'Use AI to turn noisy team activity into summaries, next steps, and useful insights that help everyone stay aligned.',
    highlights: [
      'Conversation summaries for faster catch-up',
      'Suggested action items from team discussions',
      'Workspace insights that surface blockers and progress',
      'Helpful drafting support for updates and docs',
    ],
    workflow: ['Review activity', 'Generate summary', 'Extract actions', 'Share update'],
    stats: [
      { label: 'Summaries', value: 'Instant' },
      { label: 'Actions', value: 'Suggested' },
      { label: 'Context', value: 'Workspace-aware' },
    ],
  },
  {
    id: 6,
    slug: 'team-collaboration',
    icon: Users,
    title: 'Team Collaboration',
    eyebrow: 'Connected workspaces',
    description: 'Seamlessly work together with integrated team spaces and workflows',
    color: 'from-indigo-600 to-blue-600',
    hero:
      'Give every team a connected workspace for people, projects, files, messages, and decisions.',
    highlights: [
      'Team spaces for departments, squads, and project groups',
      'Shared activity timelines across collaboration work',
      'Profiles, roles, and collaboration requests',
      'Integrated workflows across messaging, tasks, docs, and meetings',
    ],
    workflow: ['Create space', 'Add teammates', 'Connect work', 'Collaborate daily'],
    stats: [
      { label: 'Spaces', value: 'Integrated' },
      { label: 'Teams', value: 'Aligned' },
      { label: 'Workflow', value: 'Unified' },
    ],
  },
]

export const platformHighlights = [
  { icon: Shield, label: 'Security foundations', desc: 'Authentication, permissions, and protected secrets' },
  { icon: Sparkles, label: 'Premium UX', desc: 'Clean workflows for modern teams' },
  { icon: Bot, label: 'AI Ready', desc: 'Smarter collaboration assistance' },
  { icon: Users, label: 'Team First', desc: 'Built around people and projects' },
]
