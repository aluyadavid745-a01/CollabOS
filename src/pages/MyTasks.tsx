import React from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/Common/Button'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { createDefaultProfile } from '../types/profile'
import { readLocalProjects } from '../utils/localProjects'
import { createLocalTask, readLocalTasks, writeLocalTasks } from '../utils/localTasks'
import { recordLocalActivity } from '../utils/localActivity'
import { syncBeginnerWorkspaceToCloud } from '../utils/beginnerWorkspaceSync'
import { showToast } from '../utils/toast'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'

const MyTasks: React.FC = () => {
  const { profile } = useAuth()
  const activeProfile = profile || createDefaultProfile({ name: 'CollabOS User', email: '' })
  const [tasks, setTasks] = React.useState(() => readLocalTasks())
  const [projects] = React.useState(() => readLocalProjects())
  const [title, setTitle] = React.useState('')
  const [dueAt, setDueAt] = React.useState('')
  const [projectId, setProjectId] = React.useState('')

  const saveTasks = (nextTasks: typeof tasks, successMessage: string) => {
    if (!writeLocalTasks(nextTasks)) {
      showToast({ message: "We couldn't save your task. Please try again.", type: 'error' })
      return
    }

    setTasks(nextTasks)
    showToast({ message: successMessage, type: 'success' })
    void syncBeginnerWorkspaceToCloud()
  }

  const addTask = () => {
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      showToast({ message: 'Type a task first.', type: 'warning' })
      return
    }

    const nextTask = createLocalTask({
      title: cleanTitle,
      owner: activeProfile.name,
      dueAt: dueAt || undefined,
      projectId: projectId || undefined,
    })

    saveTasks([nextTask, ...tasks], `Task created successfully: ${nextTask.title}`)
    recordLocalActivity({ type: 'task', title: 'Task added', detail: nextTask.title, route: '/tasks' })
    setTitle('')
    setDueAt('')
    setProjectId('')
  }

  const toggleTask = (taskId: string) => {
    const selectedTask = tasks.find((task) => task.id === taskId)
    saveTasks(
      tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task),
      selectedTask
        ? `Task updated successfully: ${selectedTask.title} is ${selectedTask.done ? 'open' : 'done'}`
        : 'Task updated successfully'
    )
    recordLocalActivity({ type: 'task', title: 'Task updated', detail: 'Task status changed', route: '/tasks' })
  }

  const deleteTask = (taskId: string) => {
    const selectedTask = tasks.find((task) => task.id === taskId)
    if (!selectedTask) return

    const confirmed = window.confirm(`Delete task?\n\nThis will permanently remove "${selectedTask.title}" from your task list.\n\nCancel keeps the task. OK deletes it.`)
    if (!confirmed) return

    saveTasks(tasks.filter((task) => task.id !== taskId), `Task deleted: ${selectedTask.title}`)
    recordLocalActivity({ type: 'task', title: 'Task deleted', detail: selectedTask.title, route: '/tasks' })
  }

  const openTasks = tasks.filter((task) => !task.done)
  const doneTasks = tasks.filter((task) => task.done)

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">My Tasks</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Add anything you need to remember for later. Keep it simple, like a to-do list.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className={`${panel} px-5 py-3`}>
              <p className="text-2xl font-black">{openTasks.length}</p>
              <p className="text-xs font-bold text-slate-500">To do</p>
            </div>
            <div className={`${panel} px-5 py-3`}>
              <p className="text-2xl font-black">{doneTasks.length}</p>
              <p className="text-xs font-bold text-slate-500">Done</p>
            </div>
          </div>
        </header>

        <section className={`${panel} mb-5 p-4 sm:p-5`}>
          <h2 className="text-xl font-black">Create a task for later</h2>
          <p className="mt-1 text-sm text-slate-600">Type what you need to do. You can add a date if you want.</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addTask()
                }
              }}
              className="min-h-[48px] rounded-lg border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              placeholder="Add a task, like Pay electricity bill"
              aria-label="Task name"
              autoFocus
            />
            <input
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              className="min-h-[48px] rounded-lg border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              aria-label="Due date"
            />
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" aria-label="Project">
              <option value="">No project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <Button type="button" onClick={addTask} className="min-h-[48px] gap-2">
              <Plus className="h-5 w-5" />
              Add Task
            </Button>
          </div>
        </section>

        <section className={`${panel} overflow-hidden`}>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-black">To-do list</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {tasks.length ? tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-start gap-3 p-4 ${task.done ? 'bg-emerald-50/50' : 'bg-white'}`}
              >
                <button type="button" onClick={() => toggleTask(task.id)} className="mt-1 text-slate-500 hover:text-emerald-700" aria-label={task.done ? 'Mark task as not done' : 'Mark task done'}>
                  {task.done ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Circle className="h-6 w-6" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-bold ${task.done ? 'text-slate-500 line-through' : 'text-slate-950'}`}>{task.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    {new Date(task.dueAt).toLocaleDateString()}
                  </p>
                  {task.projectId && <p className="mt-1 text-xs font-bold text-slate-400">{projects.find((project) => project.id === task.projectId)?.name || 'Project'}</p>}
                </div>
                <button type="button" onClick={() => deleteTask(task.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete task">
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            )) : (
              <div className="p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-black">No tasks yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Create a task for later so it does not get lost. Start with one simple thing you need to do.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export default MyTasks
