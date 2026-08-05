import React from 'react'
import { ExternalLink } from 'lucide-react'
import type { ProfileProject } from '../types/profile'

interface ProjectsProps {
  projects: ProfileProject[]
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-xl font-bold text-slate-950">Projects</h2>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
        {projects.length} showcased
      </span>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <article key={project.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          {project.imageURL && (
            <img
              src={project.imageURL}
              alt={project.name}
              className="mb-4 h-36 w-full rounded-lg object-cover"
            />
          )}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">{project.name}</h3>
              <p className="text-sm font-semibold text-indigo-600">Role: {project.role}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                project.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span key={tech} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                {tech}
              </span>
            ))}
          </div>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-500"
            >
              View project
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </article>
      ))}
      {!projects.length && <p className="text-sm text-slate-500">No projects added yet.</p>}
    </div>
  </section>
)

export default Projects
