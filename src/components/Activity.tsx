import React from 'react'
import { FileUp, FolderPlus, MessageSquare, Users, Workflow } from 'lucide-react'
import type { ProfileActivity } from '../types/profile'

interface ActivityProps {
  activity: ProfileActivity[]
}

const iconMap = {
  project: FolderPlus,
  team: Users,
  comment: MessageSquare,
  file: FileUp,
  collaboration: Workflow,
}

const Activity: React.FC<ActivityProps> = ({ activity }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
    <h2 className="text-xl font-bold text-slate-950">Recent activity</h2>
    <div className="mt-5 space-y-4">
      {activity.map((item) => {
        const Icon = iconMap[item.type]
        return (
          <div key={item.id} className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="border-b border-slate-100 pb-4">
              <p className="font-bold text-slate-900">{item.label}</p>
              <p className="text-sm leading-6 text-slate-600">{item.detail}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )
      })}
      {!activity.length && <p className="text-sm text-slate-500">No activity yet.</p>}
    </div>
  </section>
)

export default Activity
