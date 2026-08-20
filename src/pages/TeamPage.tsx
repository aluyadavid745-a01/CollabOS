import React from 'react'
import { ArrowLeft, Plus, Trash2, UserPlus, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { createLocalTeamMember, readLocalTeamMembers, writeLocalTeamMembers } from '../utils/localWorkspace'
import { showToast } from '../utils/toast'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'

const TeamPage: React.FC = () => {
  const navigate = useNavigate()
  const [members, setMembers] = React.useState(() => readLocalTeamMembers())
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState('Member')

  const addMember = () => {
    if (!name.trim()) {
      showToast({ message: 'Add a name first.', type: 'warning' })
      return
    }

    const member = createLocalTeamMember({ name, email, role })
    if (!writeLocalTeamMembers([member, ...members])) {
      showToast({ message: "We couldn't add this person. Please try again.", type: 'error' })
      return
    }

    setMembers([member, ...members])
    setName('')
    setEmail('')
    setRole('Member')
    showToast({ message: 'Team member added', type: 'success' })
  }

  const removeMember = (memberId: string) => {
    const nextMembers = members.filter((member) => member.id !== memberId)
    if (!writeLocalTeamMembers(nextMembers)) {
      showToast({ message: "We couldn't remove this person. Please try again.", type: 'error' })
      return
    }
    setMembers(nextMembers)
    showToast({ message: 'Team member removed', type: 'success' })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate('/home')} className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Home
        </button>
        <header className="mb-6">
          <h1 className="text-3xl font-black sm:text-4xl">Team</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Add the people you work with so tasks, projects, and updates have clear owners.</p>
        </header>

        <section className={`${panel} mb-5 p-4 sm:p-5`}>
          <h2 className="text-xl font-black">Invite your team</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_160px_auto]">
            <input value={name} onChange={(event) => setName(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="Name" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="Email" />
            <input value={role} onChange={(event) => setRole(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="Role" />
            <Button type="button" onClick={addMember} className="min-h-[48px] gap-2"><Plus className="h-4 w-4" />Add</Button>
          </div>
        </section>

        <section className={`${panel} overflow-hidden`}>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-black">People</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {members.length ? members.map((member) => (
              <article key={member.id} className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 font-black text-slate-700">{member.name.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{member.name}</p>
                  <p className="text-sm font-semibold text-slate-500">{member.email || 'No email'} - {member.role}</p>
                </div>
                <button type="button" onClick={() => removeMember(member.id)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove team member">
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            )) : (
              <div className="p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-black">No team members yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Add one person to show how collaboration works.</p>
                <UserPlus className="mx-auto mt-4 h-5 w-5 text-slate-400" />
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default TeamPage
