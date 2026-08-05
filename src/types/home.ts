export type HomeNotificationType =
  | 'message'
  | 'mention'
  | 'meeting'
  | 'project'
  | 'website'
  | 'invite'
  | 'security'
  | 'ai'

export interface HomeNotification {
  id: string
  type: HomeNotificationType
  title: string
  body: string
  source: string
  route: string
  createdAt: string
  read: boolean
  priority: 'low' | 'normal' | 'high'
}

export interface HomeTask {
  id: string
  title: string
  owner: string
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done'
  dueAt: string
  route: string
}
