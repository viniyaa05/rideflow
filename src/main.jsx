import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('RideFlow App Error Caught by Boundary:', error, info);
    this.setState({ info });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <div style={{ maxWidth: '520px', width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
              ⚠️ Interface Notice
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              RideFlow Application Initializer
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>
              The application encountered a stale browser cache or initialization state. Click the button below to reset the session and load fresh data.
            </p>
            {this.state.error && (
              <pre style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#334155', overflowX: 'auto', marginBottom: '20px' }}>
                {this.state.error.toString()}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={this.handleReset}
                style={{ flex: 1, backgroundColor: '#9333ea', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Reset Session & Load App
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '12px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

