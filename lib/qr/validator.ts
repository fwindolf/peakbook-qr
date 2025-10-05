import { QR_CONFIG, QRConfigUtils } from './config';
import type {
  QRValidationResult,
  QRCapacityResult,
  QRFormData,
  ValidationErrors,
} from './types';

export class QRValidator {
  /**
   * Validates a token according to Peakbook requirements
   */
  validateToken(token: string): QRValidationResult {
    return QRConfigUtils.validateToken(token);
  }

  /**
   * Validates caption text
   */
  validateCaption(caption?: string): QRValidationResult {
    if (!caption) {
      return { valid: true }; // Caption is optional
    }

    if (caption.length > QR_CONFIG.CAPTION.MAX_LENGTH) {
      return {
        valid: false,
        error: QR_CONFIG.MESSAGES.CAPTION_TOO_LONG,
      };
    }

    // Check for potentially problematic characters that might not print well
    const problematicChars = /[<>{}\\]/;
    if (problematicChars.test(caption)) {
      return {
        valid: false,
        error: 'Caption contains characters that may not print correctly',
      };
    }

    return { valid: true };
  }

  /**
   * Validates parameter name for URL construction
   */
  validateParameterName(paramName: string): QRValidationResult {
    if (!paramName) {
      return {
        valid: false,
        error: 'Parameter name is required',
      };
    }

    // Must be valid URL parameter name (alphanumeric, underscore, hyphen)
    const validParamPattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
    if (!validParamPattern.test(paramName)) {
      return {
        valid: false,
        error:
          'Parameter name must start with a letter and contain only letters, numbers, underscores, or hyphens',
      };
    }

    return { valid: true };
  }

  /**
   * Validates generated URL
   */
  validateURL(url: string): QRValidationResult {
    try {
      const urlObj = new URL(url);

      // Must be HTTPS
      if (urlObj.protocol !== 'https:') {
        return {
          valid: false,
          error: 'URL must use HTTPS protocol',
        };
      }

      // Must be peakbook.app domain
      if (urlObj.hostname !== 'peakbook.app') {
        return {
          valid: false,
          error: 'URL must be for peakbook.app domain',
        };
      }

      // Must have the scan path
      if (urlObj.pathname !== '/scan') {
        return {
          valid: false,
          error: 'URL must use /scan path',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format',
      };
    }
  }

  /**
   * Validates error correction level
   */
  validateECCLevel(eccLevel: string): QRValidationResult {
    const validLevels = ['L', 'M', 'Q', 'H'];

    if (!validLevels.includes(eccLevel)) {
      return {
        valid: false,
        error: 'Error correction level must be L, M, Q, or H',
      };
    }

    return { valid: true };
  }

  /**
   * Validates all form inputs at once
   */
  validateAll(formData: QRFormData): { valid: boolean; errors: ValidationErrors } {
    const errors: ValidationErrors = {};
    let valid = true;

    // Validate token
    const tokenValidation = this.validateToken(formData.token);
    if (!tokenValidation.valid) {
      errors.token = tokenValidation.error;
      valid = false;
    }

    // Validate caption
    const captionValidation = this.validateCaption(formData.caption);
    if (!captionValidation.valid) {
      errors.caption = captionValidation.error;
      valid = false;
    }

    // Validate parameter name
    const paramName = formData.paramName || QR_CONFIG.DEFAULT_PARAM_NAME;
    const paramValidation = this.validateParameterName(paramName);
    if (!paramValidation.valid) {
      errors.paramName = paramValidation.error;
      valid = false;
    }

    // Validate ECC level
    if (formData.eccLevel) {
      const eccValidation = this.validateECCLevel(formData.eccLevel);
      if (!eccValidation.valid) {
        errors.eccLevel = eccValidation.error;
        valid = false;
      }
    }

    // Validate generated URL if basic validation passed
    if (valid) {
      const url = QRConfigUtils.buildURL(formData.token, paramName);
      const urlValidation = this.validateURL(url);
      if (!urlValidation.valid) {
        errors.url = urlValidation.error;
        valid = false;
      }
    }

    return { valid, errors };
  }

  /**
   * Sanitizes user input to prevent issues
   */
  sanitizeInput(input: string, type: 'token' | 'caption' | 'param' | 'text' = 'text'): string {
    if (!input) return '';

    let sanitized = input.trim();

    switch (type) {
      case 'token':
        // Convert to uppercase and remove invalid characters
        sanitized = sanitized.toUpperCase().replace(/[^A-Z0-9]/g, '');
        break;

      case 'caption':
        // Remove potentially problematic characters but keep basic punctuation
        sanitized = sanitized.replace(/[<>{}\\]/g, '');
        break;

      case 'param':
        // Keep only valid parameter name characters
        sanitized = sanitized.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (sanitized && !/^[a-z]/.test(sanitized)) {
          sanitized = 't' + sanitized; // Ensure starts with letter
        }
        break;

      default:
        // Basic text sanitization
        sanitized = sanitized.replace(/[<>{}\\]/g, '');
    }

    return sanitized;
  }

  /**
   * Gets helpful validation message for token input
   */
  getTokenHelpText(token: string): string {
    if (!token) {
      return 'Enter a 20-character token';
    }

    const length = token.length;
    const remaining = QR_CONFIG.TOKEN_LENGTH - length;

    if (length < QR_CONFIG.TOKEN_LENGTH) {
      return `${remaining} more character${remaining !== 1 ? 's' : ''} needed`;
    }

    if (length === QR_CONFIG.TOKEN_LENGTH) {
      const validation = this.validateToken(token);
      return validation.valid ? '✓ Token is valid' : validation.error || 'Invalid token';
    }

    return 'Token is too long';
  }

  /**
   * Real-time input formatter for token field
   */
  formatTokenInput(input: string): string {
    return this.sanitizeInput(input, 'token').substring(0, QR_CONFIG.TOKEN_LENGTH);
  }

  /**
   * Checks if QR code will be scannable with given parameters
   */
  checkScannability(
    url: string,
    eccLevel: 'L' | 'M' | 'Q' | 'H' = 'H'
  ): {
    scannable: boolean;
    warning: string | null;
    capacity: QRCapacityResult;
  } {
    const capacity = QRConfigUtils.checkQRCapacity(url, eccLevel);

    let warning: string | null = null;
    if (!capacity.withinLimit) {
      warning = 'URL is too long for QR code generation';
    } else if (capacity.nearLimit) {
      warning = `URL is using ${capacity.percentUsed}% of QR code capacity`;
    }

    return {
      scannable: capacity.withinLimit,
      warning,
      capacity,
    };
  }

  /**
   * Validates file name for downloads
   */
  validateFilename(filename: string): {
    valid: boolean;
    error: string | null;
    sanitized: string;
  } {
    if (!filename) {
      return {
        valid: false,
        error: 'Filename is required',
        sanitized: 'sticker.svg',
      };
    }

    // Remove problematic characters for cross-platform compatibility
    const sanitized = filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .toLowerCase();

    // Ensure .svg extension
    const finalName = sanitized.endsWith('.svg') ? sanitized : sanitized + '.svg';

    // Check length (most filesystems support 255 chars)
    if (finalName.length > 200) {
      return {
        valid: false,
        error: 'Filename is too long',
        sanitized: finalName.substring(0, 196) + '.svg',
      };
    }

    return {
      valid: true,
      error: null,
      sanitized: finalName,
    };
  }

  /**
   * Validates print dimensions
   */
  validatePrintDimensions(
    width: number,
    height: number
  ): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let valid = true;

    // Convert to mm for validation
    const widthMm = QRConfigUtils.pxToMm(width);
    const heightMm = QRConfigUtils.pxToMm(height);

    if (widthMm < 10 || heightMm < 10) {
      warnings.push('Sticker size may be too small for reliable scanning');
    }

    if (widthMm > 200 || heightMm > 200) {
      warnings.push('Sticker size is unusually large for typical use');
    }

    if (Math.abs(widthMm - heightMm) > 2) {
      warnings.push('Sticker is not square - this may affect scanning');
    }

    return { valid, warnings };
  }

  /**
   * Validates SVG content for common issues
   */
  validateSVGContent(svgString: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    let valid = true;

    if (!svgString || !svgString.trim()) {
      return { valid: false, issues: ['SVG content is empty'] };
    }

    // Check for proper SVG structure
    if (!svgString.includes('<svg')) {
      issues.push('Missing SVG root element');
      valid = false;
    }

    // Check for proper namespace
    if (!svgString.includes('xmlns')) {
      issues.push('Missing SVG namespace - may not display properly');
    }

    // Check for viewBox or width/height
    if (!svgString.includes('viewBox') && !svgString.includes('width=')) {
      issues.push('Missing dimensions - SVG may not scale properly');
    }

    // Check for very large file size (over 1MB is unusual for QR stickers)
    if (svgString.length > 1024 * 1024) {
      issues.push('SVG file is very large - consider optimizing');
    }

    return { valid, issues };
  }
}

// Export singleton instance for convenience
export const qrValidator = new QRValidator();
