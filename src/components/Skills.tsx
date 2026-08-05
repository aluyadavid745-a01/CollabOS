import React from 'react'

interface SkillsProps {
  title: string
  items: string[]
  tone?: 'indigo' | 'cyan'
}

const Skills: React.FC<SkillsProps> = ({ title, items, tone = 'indigo' }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
    <h2 className="text-xl font-bold text-slate-950">{title}</h2>
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-2 text-sm font-semibold ${
            tone === 'indigo' ? 'bg-indigo-50 text-indigo-700' : 'bg-cyan-50 text-cyan-700'
          }`}
        >
          {item}
        </span>
      ))}
      {!items.length && <p className="text-sm text-slate-500">Nothing added yet.</p>}
    </div>
  </section>
)

export default Skills
