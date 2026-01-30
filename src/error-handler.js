/**
 * Error Handler Module
 * Centralized error handling and reporting
 */

const { app, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

class ErrorHandler {
  constructor() {
    this.logPath = path.join(app.getPath('userData'), 'logs');
    this.errorLogFile = path.join(this.logPath, 'error.log');

    // Ensure log directory exists
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }

    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleError(error, 'Uncaught Exception');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleError(new Error(String(reason)), 'Unhandled Rejection', { promise });
    });

    // Handle Electron errors
    app.on('render-process-gone', (event, webContents, details) => {
      this.handleError(
        new Error(`Render process gone: ${details.reason}`),
        'Render Process Error',
        details
      );
    });

    app.on('child-process-gone', (event, details) => {
      this.handleError(
        new Error(`Child process gone: ${details.type}`),
        'Child Process Error',
        details
      );
    });
  }

  handleError(error, type = 'Error', metadata = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type,
      message: error.message,
      stack: error.stack,
      metadata,
      app: {
        version: app.getVersion(),
        name: app.getName(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.versions.node,
        electronVersion: process.versions.electron
      }
    };

    // Log to console
    console.error(`[${type}]`, error);
    console.error('Stack:', error.stack);
    console.error('Metadata:', metadata);

    // Write to log file
    this.writeToLog(errorInfo);

    // Show user-friendly error dialog (only for critical errors)
    if (this.isCritical(error)) {
      this.showErrorDialog(error, type);
    }

    // In production, could send to error reporting service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      this.reportToService(errorInfo);
    }
  }

  writeToLog(errorInfo) {
    try {
      const logEntry = JSON.stringify(errorInfo, null, 2) + '\n' + '-'.repeat(80) + '\n';
      fs.appendFileSync(this.errorLogFile, logEntry);
    } catch (err) {
      console.error('Failed to write error log:', err);
    }
  }

  showErrorDialog(error, type) {
    dialog.showErrorBox(
      `${type} Occurred`,
      `An error has occurred in Big-AGI MCP Assistant.\n\n` +
      `${error.message}\n\n` +
      `The error has been logged. Please check the logs at:\n${this.errorLogFile}`
    );
  }

  isCritical(error) {
    // Define which errors are critical enough to show a dialog
    const criticalKeywords = [
      'ENOSPC', // No space left
      'EPERM',  // Permission denied
      'EACCES', // Access denied
      'Fatal',
      'Critical'
    ];

    return criticalKeywords.some(keyword =>
      error.message.includes(keyword) || error.stack.includes(keyword)
    );
  }

  reportToService(errorInfo) {
    // Placeholder for error reporting service integration
    // Example: Sentry, Bugsnag, Rollbar, etc.

    // For Sentry integration:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(new Error(errorInfo.message), {
    //     tags: { type: errorInfo.type },
    //     extra: errorInfo
    //   });
    // }

    console.log('[ErrorHandler] Error would be reported to service:', errorInfo.type);
  }

  getLogs() {
    try {
      if (fs.existsSync(this.errorLogFile)) {
        return fs.readFileSync(this.errorLogFile, 'utf8');
      }
      return 'No error logs found.';
    } catch (err) {
      return `Failed to read logs: ${err.message}`;
    }
  }

  clearLogs() {
    try {
      if (fs.existsSync(this.errorLogFile)) {
        fs.unlinkSync(this.errorLogFile);
        return true;
      }
      return true;
    } catch (err) {
      console.error('Failed to clear logs:', err);
      return false;
    }
  }

  getLogPath() {
    return this.errorLogFile;
  }
}

// Export singleton
let errorHandler = null;

function getErrorHandler() {
  if (!errorHandler) {
    errorHandler = new ErrorHandler();
  }
  return errorHandler;
}

module.exports = { getErrorHandler, ErrorHandler };
