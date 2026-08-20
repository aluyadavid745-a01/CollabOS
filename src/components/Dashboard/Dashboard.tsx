import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Bot, CalendarClock, CheckCircle2, FileText, Folder, MessageSquare, Users } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const Dashboard: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 28, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          immediateRender: false,
        }
      )

      gsap.fromTo(
        descRef.current,
        { y: 18, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.15,
          immediateRender: false,
        }
      )

      gsap.fromTo(
        imageRef.current,
        { scale: 0.96, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          scale: 1,
          opacity: 1,
          duration: 0.9,
          delay: 0.25,
          immediateRender: false,
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    { icon: CheckCircle2, label: 'Today’s tasks', detail: 'Know exactly what needs attention.' },
    { icon: Folder, label: 'Active projects', detail: 'Track owners, deadlines, and progress.' },
    { icon: MessageSquare, label: 'Team updates', detail: 'Keep decisions close to the work.' },
    { icon: Bot, label: 'AI next action', detail: 'Turn intent into workspace actions.' },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-slate-200 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-16 lg:py-36"
      id="dashboard"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Product cockpit
            </div>
            <h2 ref={titleRef} className="text-4xl font-black leading-tight text-slate-950 md:text-5xl lg:text-6xl">
              Every morning starts with one clear screen.
            </h2>
          </div>
          <p ref={descRef} className="max-w-2xl text-lg leading-8 text-slate-600">
            The dashboard pulls together tasks, active projects, messages, files, meetings, team activity, and the next best action so a beginner understands the workspace in minutes.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <Icon className="h-5 w-5 text-slate-600" />
                <h3 className="mt-4 font-black text-slate-950">{feature.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.detail}</p>
              </motion.article>
            )
          })}
        </div>

        <motion.div
          ref={imageRef}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-[1.4rem] border border-slate-300 bg-white p-2 shadow-2xl shadow-slate-300/60"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-slate-500">Home</p>
                <h3 className="text-2xl font-black text-slate-950">Good morning, David</h3>
              </div>
              <button type="button" className="min-h-[44px] rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15">
                + Create
              </button>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
              <section className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ['Tasks due today', '4'],
                    ['Active projects', '2'],
                    ['Upcoming meetings', '1'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-3xl font-black text-slate-950">{value}</p>
                      <p className="mt-2 text-sm font-bold text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-black text-slate-950">Website redesign</h4>
                      <p className="mt-1 text-sm font-semibold text-slate-500">8 tasks, 3 owners, Friday deadline</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">Active</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-full w-2/3 rounded-full bg-slate-950" />
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {[
                      ['Finalize landing copy', 'Done'],
                      ['Upload demo screenshots', 'Today'],
                      ['Review pricing limits', 'Today'],
                      ['Invite design reviewer', 'Tomorrow'],
                    ].map(([task, status]) => (
                      <div key={task} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-bold text-slate-800">{task}</p>
                        <p className="mt-1 text-xs font-black uppercase tracking-wider text-slate-500">{status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-950">AI next action</h4>
                      <p className="text-sm font-semibold text-slate-500">Workspace-aware</p>
                    </div>
                  </div>
                  <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                    Finish the pricing copy, then assign the demo screenshot task before today’s check-in.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="font-black text-slate-950">Team activity</h4>
                  <div className="mt-4 space-y-3">
                    {[
                      [Users, 'Sarah joined Website redesign'],
                      [FileText, 'Pitch deck outline saved'],
                      [CalendarClock, 'Launch review at 2:00 PM'],
                    ].map(([Icon, item]) => {
                      const ActivityIcon = Icon as typeof Users
                      return (
                        <div key={String(item)} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <ActivityIcon className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-bold text-slate-700">{String(item)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Dashboard
