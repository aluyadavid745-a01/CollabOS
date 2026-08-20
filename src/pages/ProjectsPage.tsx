import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarClock, CheckCircle2, Folder, Plus, Trash2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { createLocalProject, readLocalProjects, writeLocalProjects, type LocalProjectStatus } from '../utils/localProjects'
import { readLocalTasks } from '../utils/localTasks'
import { createAiLaunchPlan } from '../utils/investorDemo'
import { recordLocalActivity } from '../utils/localActivity'
import { showToast } from '../utils/toast'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'

const statusOptions: LocalProjectStatus[] = ['Planning', 'Active', 'Done']

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = React.useState(() => readLocalProjects())
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [members, setMembers] = React.useState('')
  const [deadline, setDeadline] = React.useState('')
  const [aiPrompt, setAiPrompt] = React.useState('Plan a launch for our new app')
  const [refreshKey, setRefreshKey] = React.useState(0)
  const tasks = React.useMemo(() => {
    void refreshKey
    return readLocalTasks()
  }, [refreshKey])

  const saveProjects = (nextProjects: typeof projects, message: string) => {
    if (!writeLocalProjects(nextProjects)) {
      showToast({ message: "We couldn't save your project. Please try again.", type: 'error' })
      return
    }

    setProjects(nextProjects)
    showToast({ message, type: 'success' })
  }

  const addProject = () => {
    const cleanName = name.trim()
    if (!cleanName) {
      showToast({ message: 'Add a project name first.', type: 'warning' })
      return
    }

    const project = createLocalProject({
      name: cleanName,
      description,
      members,
      deadline,
      status: 'Planning',
    })

    saveProjects([project, ...projects], 'Project created')
    recordLocalActivity({ type: 'project', title: 'Project created', detail: project.name, route: '/projects' })
    setName('')
    setDescription('')
    setMembers('')
    setDeadline('')
  }

  const updateStatus = (projectId: string, status: LocalProjectStatus) => {
    saveProjects(
      projects.map((project) => project.id === projectId ? { ...project, status, updatedAt: new Date().toISOString() } : project),
      'Project updated'
    )
    recordLocalActivity({ type: 'project', title: 'Project updated', detail: status, route: '/projects' })
  }

  const deleteProject = (projectId: string) => {
    saveProjects(projects.filter((project) => project.id !== projectId), 'Project deleted')
    recordLocalActivity({ type: 'project', title: 'Project deleted', detail: 'A project was removed', route: '/projects' })
  }

  const activeProjects = projects.filter((project) => project.status !== 'Done')

  const generatePlan = () => {
    const project = createAiLaunchPlan(aiPrompt, 'You')
    setProjects(readLocalProjects())
    setRefreshKey((value) => value + 1)
    showToast({ message: `${project.name} plan created`, type: 'success' })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button type="button" onClick={() => navigate('/home')} className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-bold text-slate-600 hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Home
            </button>
            <h1 className="text-3xl font-black sm:text-4xl">Projects</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Plan work in one place. Create a project, add who is involved, set a deadline, then add tasks.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className={`${panel} px-5 py-3`}>
              <p className="text-2xl font-black">{activeProjects.length}</p>
              <p className="text-xs font-bold text-slate-500">Active</p>
            </div>
            <div className={`${panel} px-5 py-3`}>
              <p className="text-2xl font-black">{projects.length}</p>
              <p className="text-xs font-bold text-slate-500">Total</p>
            </div>
          </div>
        </header>

        <section className={`${panel} mb-5 p-4 sm:p-5`}>
          <h2 className="text-xl font-black">Ask AI to create a project plan</h2>
          <p className="mt-1 text-sm text-slate-600">Describe the outcome. CollabOS will create a project, tasks, a meeting, message, and file.</p>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row">
            <input value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} className="min-h-[48px] min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
            <Button type="button" onClick={generatePlan} className="min-h-[48px] gap-2">
              <Plus className="h-5 w-5" />
              Generate Plan
            </Button>
          </div>
        </section>

        <section className={`${panel} mb-5 p-4 sm:p-5`}>
          <h2 className="text-xl font-black">Create a project</h2>
          <p className="mt-1 text-sm text-slate-600">Use this for work like website redesign, marketing campaign, mobile app, or company launch.</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Project name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="Website redesign" autoFocus />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Deadline</span>
              <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="mt-2 min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-sm font-bold text-slate-700">Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="What should this project accomplish?" />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-sm font-bold text-slate-700">Team members</span>
              <input value={members} onChange={(event) => setMembers(event.target.value)} className="mt-2 min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="Sarah, David, Alex" />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={addProject} className="min-h-[48px] gap-2">
              <Plus className="h-5 w-5" />
              Create Project
            </Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {projects.length ? projects.map((project, index) => (
            (() => {
              const projectTasks = tasks.filter((task) => task.projectId === project.id)
              const doneCount = projectTasks.filter((task) => task.done).length
              const progress = projectTasks.length ? Math.round((doneCount / projectTasks.length) * 100) : 0

              return (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`${panel} p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    <Folder className="h-3.5 w-3.5" />
                    {project.status}
                  </p>
                  <h2 className="text-xl font-black">{project.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{project.description || 'No description yet.'}</p>
                </div>
                <button type="button" onClick={() => deleteProject(project.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete project">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span>{projectTasks.length} task{projectTasks.length === 1 ? '' : 's'}</span>
                  <span>{progress}% complete</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white">
                  <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} />
                </div>
                {projectTasks.slice(0, 3).map((task) => (
                  <p key={task.id} className="mt-2 text-sm font-semibold text-slate-600">{task.done ? 'Done' : 'To do'} - {task.title}</p>
                ))}
              </div>

              <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {project.members.length ? `${project.members.length} member${project.members.length === 1 ? '' : 's'}` : 'No members yet'}
                </p>
              </div>

              {project.members.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.members.map((member) => (
                    <span key={member} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">{member}</span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <select value={project.status} onChange={(event) => updateStatus(project.id, event.target.value as LocalProjectStatus)} className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10">
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
                <Button type="button" variant="secondary" onClick={() => navigate('/tasks')} className="min-h-[44px] gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Add tasks
                </Button>
              </div>
            </motion.article>
              )
            })()
          )) : (
            <div className={`${panel} p-8 text-center lg:col-span-2`}>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <Folder className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-black">No projects yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Projects help you organize your team's work. Create one for a campaign, launch, app, event, or client job.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ProjectsPage
