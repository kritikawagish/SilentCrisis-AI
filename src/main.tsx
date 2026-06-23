interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message ?? 'Unknown error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console so it appears in Vercel runtime logs
    console.error('[SilentCrisis] Render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0a0418',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f4ecdf',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            padding: '2rem',
            gap: '1rem',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="2" fill="#ff9b6a" />
            <circle cx="6" cy="6" r="1.2" fill="#ff9b6a" opacity="0.7" />
            <circle cx="22" cy="8" r="1.2" fill="#ff9b6a" opacity="0.7" />
            <circle cx="8" cy="22" r="1.2" fill="#ff9b6a" opacity="0.7" />
            <circle cx="22" cy="22" r="1.2" fill="#ff9b6a" opacity="0.7" />
          </svg>
          <p style={{ fontSize: '1.25rem', fontWeight: 200, opacity: 0.9 }}>
            Something went wrong loading the app.
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              background: 'rgba(255,155,106,0.08)',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              color: '#ff9b6a',
              maxWidth: '600px',
              wordBreak: 'break-word',
            }}
          >
            {this.state.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              background: '#ff9b6a',
              color: '#0a0418',
              border: 'none',
              padding: '0.6rem 1.5rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 200,
              fontSize: '1rem',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
