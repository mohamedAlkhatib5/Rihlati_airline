import { Component } from 'react';
import { withTranslation } from 'react-i18next';

import './error-boundary.css';

/**
 * Catches render-time errors anywhere below it and shows a recovery screen
 * instead of unmounting the whole app into a blank page.
 *
 * Must stay a class component — React exposes no hook equivalent for
 * `componentDidCatch`.
 */
class ErrorBoundaryBase extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Replace with a reporting service (e.g. Sentry) once one is configured.
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign('/');
  };

  render() {
    const { t, children } = this.props;

    if (!this.state.hasError) return children;

    return (
      <div className="error-boundary" role="alert">
        <h1>{t('errors.boundaryTitle')}</h1>
        <p>{t('errors.boundaryText')}</p>
        <div className="error-boundary__actions">
          <button
            type="button"
            className="primary-action"
            onClick={this.handleReload}
          >
            {t('errors.reload')}
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={this.handleGoHome}
          >
            {t('errors.home')}
          </button>
        </div>
      </div>
    );
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);
