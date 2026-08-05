import React from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { featureDetails, platformHighlights } from '../data/features'

const FeatureDetail: React.FC = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const feature = featureDetails.find((item) => item.slug === slug)

  if (!feature) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-4 py-8 text-white md:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate('/#features')}
            className="mb-10 inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to features
          </button>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
            <h1 className="text-3xl font-bold">Feature not found</h1>
            <p className="mt-3 text-slate-300">Choose a feature from the CollabOS homepage.</p>
          </section>
        </div>
      </main>
    )
  }

  const Icon = feature.icon
  const relatedFeatures = featureDetails.filter((item) => item.slug !== feature.slug).slice(0, 3)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
        <button
          type="button"
          onClick={() => navigate('/#features')}
          className="mb-10 inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to features
        </button>

        <section className="grid gap-10 py-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/50 bg-indigo-500/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-sm font-semibold text-transparent">
                {feature.eyebrow}
              </span>
            </div>

            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">{feature.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">{feature.hero}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button type="button" size="lg" onClick={() => navigate('/get-started')}>
                Get started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/')}>
                Return home
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-4`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">What it gives your team</h2>
            <div className="mt-5 space-y-4">
              {feature.highlights.map((highlight) => (
                <div key={highlight} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                  <p className="text-sm leading-6 text-slate-300">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold">Workflow</h2>
            <div className="mt-6 space-y-4">
              {feature.workflow.map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 text-sm font-bold">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-slate-100">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {feature.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="mb-6 text-2xl font-bold">Explore more CollabOS features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedFeatures.map((item) => {
              const RelatedIcon = item.icon
              return (
                <Link
                  key={item.slug}
                  to={`/features/${item.slug}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-indigo-500/50"
                >
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${item.color} p-3`}>
                    <RelatedIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/10 py-12 md:grid-cols-4">
          {platformHighlights.map((item) => {
            const HighlightIcon = item.icon
            return (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <HighlightIcon className="mb-3 h-5 w-5 text-indigo-400" />
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
              </div>
            )
          })}
        </section>
      </div>
    </main>
  )
}

export default FeatureDetail
