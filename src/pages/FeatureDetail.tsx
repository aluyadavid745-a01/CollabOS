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
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 md:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate('/#features')}
            className="mb-10 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to features
          </button>
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold">Feature not found</h1>
            <p className="mt-3 text-slate-600">Choose a feature from the CollabOS homepage.</p>
          </section>
        </div>
      </main>
    )
  }

  const Icon = feature.icon
  const relatedFeatures = featureDetails.filter((item) => item.slug !== feature.slug).slice(0, 3)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
        <button
          type="button"
          onClick={() => navigate('/#features')}
          className="mb-10 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to features
        </button>

        <section className="grid gap-10 py-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold">
                {feature.eyebrow}
              </span>
            </div>

            <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">{feature.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">{feature.hero}</p>

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

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-4 text-slate-700">
              <Icon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">What it gives your team</h2>
            <div className="mt-5 space-y-4">
              {feature.highlights.map((highlight) => (
                <div key={highlight} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-6 text-slate-600">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Workflow</h2>
            <div className="mt-6 space-y-4">
              {feature.workflow.map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-slate-800">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {feature.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</p>
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
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300"
                >
                  <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-700">
                    <RelatedIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="grid gap-4 border-t border-slate-200 py-12 md:grid-cols-4">
          {platformHighlights.map((item) => {
            const HighlightIcon = item.icon
            return (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <HighlightIcon className="mb-3 h-5 w-5 text-slate-600" />
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
              </div>
            )
          })}
        </section>
      </div>
    </main>
  )
}

export default FeatureDetail
