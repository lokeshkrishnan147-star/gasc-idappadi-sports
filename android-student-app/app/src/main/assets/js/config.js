/**
 * GASC Idappadi Smart Sports Management System
 * Global Application & API Configuration
 * 
 * This file centralizes the backend API endpoint for:
 * 1. Web Browser (http://localhost:5000 or production domain)
 * 2. Student Android APK (packaged webview/capacitor app)
 * 3. Sports Incharge Admin Windows EXE (Electron desktop app)
 */

(function() {
  // =========================================================================
  // 🌐 PRODUCTION BACKEND CONFIGURATION
  // =========================================================================
  // When deploying your Node.js backend to Render, Railway, or VPS,
  // simply put your online production URL here (e.g. 'https://gasc-sports-api.onrender.com').
  // When running locally, leave it as '' or 'http://localhost:5000'.
  const PRODUCTION_BACKEND_URL = 'https://gasc-idappadi-sports.onrender.com';

  // Determine current origin & environment
  const isHttpOrHttps = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  const isLocalhost = isHttpOrHttps && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );
  const isPackagedApp = !isHttpOrHttps || window.location.protocol === 'file:' || window.location.protocol === 'capacitor:';

  // Resolve active backend base URL
  let resolvedBackendOrigin = '';

  if (PRODUCTION_BACKEND_URL && PRODUCTION_BACKEND_URL.trim() !== '') {
    // If a production backend URL is explicitly configured, use it
    resolvedBackendOrigin = PRODUCTION_BACKEND_URL.replace(/\/+$/, '');
  } else if (isLocalhost) {
    // If running on a local development server, use the current host origin
    resolvedBackendOrigin = `${window.location.protocol}//${window.location.hostname}:${window.location.port || 5000}`;
  } else if (isHttpOrHttps) {
    // If hosted online, use current domain origin
    resolvedBackendOrigin = window.location.origin;
  } else {
    // Packaged App fallback (Android APK / Electron) when no backend URL is set
    resolvedBackendOrigin = 'http://10.102.54.21:5000';
  }

  // Define global config object
  window.GASC_CONFIG = {
    PRODUCTION_BACKEND_URL: PRODUCTION_BACKEND_URL,
    BACKEND_ORIGIN: resolvedBackendOrigin,
    API_BASE_URL: `${resolvedBackendOrigin}/api`,
    IS_PACKAGED_APP: isPackagedApp,
    IS_LOCALHOST: isLocalhost,

    /**
     * Resolves an API endpoint cleanly
     * @param {string} endpoint e.g. '/auth/login' or 'auth/login'
     * @returns {string} full API URL
     */
    getApiUrl: function(endpoint) {
      if (!endpoint) return this.API_BASE_URL;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return `${this.API_BASE_URL}${cleanEndpoint}`;
    },

    /**
     * Resolves an asset / upload URL cleanly
     * @param {string} relativePath e.g. '/uploads/avatar.jpg'
     * @returns {string} full URL
     */
    getAssetUrl: function(relativePath) {
      if (!relativePath) return '';
      if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
      }
      const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
      return `${this.BACKEND_ORIGIN}${cleanPath}`;
    },

    /**
     * Sets the production backend URL dynamically (useful for testing)
     */
    setProductionBackendUrl: function(url) {
      if (!url) return;
      localStorage.setItem('gasc_production_api_url', url);
      window.location.reload();
    }
  };

  // Check if an override URL was saved in localStorage for testing
  try {
    const savedUrl = localStorage.getItem('gasc_production_api_url');
    if (savedUrl && savedUrl.trim() !== '') {
      window.GASC_CONFIG.BACKEND_ORIGIN = savedUrl.replace(/\/+$/, '');
      window.GASC_CONFIG.API_BASE_URL = `${window.GASC_CONFIG.BACKEND_ORIGIN}/api`;
    }
  } catch (e) {
    // Ignore localStorage access restriction if any
  }
})();
