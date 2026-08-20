import React from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from './Button'

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('CollabOS render error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-950">
        <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/70">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-black">Something went wrong</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            CollabOS could not open this screen. Refresh the workspace and try again.
          </p>
          <Button type="button" onClick={() => window.location.reload()} className="mt-5 gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh workspace
          </Button>
        </section>
      </main>
    )
  }
}

export default ErrorBoundary
