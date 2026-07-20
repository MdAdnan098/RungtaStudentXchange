import { Component } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Top-level render-error safety net. Before this, an uncaught error
 * thrown during render anywhere in the tree (a bad API shape, a null
 * reference in a product/profile field, etc.) unmounted the whole
 * React app and left a blank white screen with no way back — for a
 * marketplace with thousands of student users, that's a dead end with
 * no recovery path other than the user guessing to hit reload.
 *
 * Deliberately class-based: React only supports error boundaries via
 * getDerivedStateFromError/componentDidCatch, there's no hook
 * equivalent. Scoped to a single boundary wrapping the whole app
 * (mounted once in App.jsx) rather than one per page/route — that
 * matches the actual failure mode here (unexpected data shape, not a
 * flaky per-route API) and avoids scattering try/catch-equivalents
 * across the codebase for a case that should be rare in production.
 */
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Unhandled render error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="flex max-w-sm flex-col items-center text-center">
            <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="text-h4 text-text">Something went wrong</h1>
            <p className="mt-2 text-body-sm text-text-muted">
              An unexpected error occurred. Try reloading the page — if it keeps
              happening, please check back later.
            </p>
            <button type="button" onClick={this.handleReload} className="btn-primary mt-6">
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
