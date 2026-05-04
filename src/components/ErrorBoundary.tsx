import React from 'react'
import { Logo } from './Logo'
import { Button } from './Button'
import { waLink } from '../lib/constants'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="bg-offwhite min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <Logo size={96} variant="mono-burgundy" className="mx-auto mb-6 opacity-60" />
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— Something went wrong —</div>
          <h1 className="font-display uppercase text-burgundy text-4xl mb-3">Oops</h1>
          <p className="font-serif italic text-burgundy/60 mb-8">
            We hit a snag loading this page. Try again, or reach out and we’ll sort it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => { this.reset(); window.location.reload() }} variant="primary" size="md">
              Try again
            </Button>
            <Button href={waLink('Hi, I hit an error on the site')} variant="secondary" size="md">
              Get help on WhatsApp
            </Button>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-8 p-4 bg-pearl text-left text-xs text-burgundy/70 rounded-sm overflow-auto max-h-48">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
