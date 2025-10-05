export const QR_CONFIG = {
  // URL Configuration
  BASE_URL: 'https://peakbook.app/scan',
  DEFAULT_PARAM_NAME: 'token',

  // Token Configuration
  TOKEN_LENGTH: 20,
  TOKEN_PATTERN: /^[A-Z0-9]{20}$/,

  // Sticker Dimensions (in pixels at 96 DPI)
  STICKER: {
    SIZE_CM: 5, // 5cm × 5cm
    SIZE_PX: 189, // 5cm at 96 DPI (189px)
    BLEED_CM: 0.3, // 3mm bleed
    BLEED_PX: 11, // 3mm at 96 DPI
    TOTAL_SIZE_PX: 211, // 189 + (11 * 2) = 211px including bleed
    CORNER_RADIUS_PX: 15, // Rounded corners
    SAFE_MARGIN_PX: 12, // Safe zone from edges
  },

  // QR Code Configuration
  QR: {
    SIZE_CM: 4, // 4cm QR code
    SIZE_PX: 151, // 4cm at 96 DPI (final printed size)
    ERROR_CORRECTION: 'Q' as const, // Use Q per design spec
    MARGIN: 0, // No built-in margin (we handle positioning)
    COLOR_DARK: '#000000', // Black QR modules
    COLOR_LIGHT: '#FFFFFF', // White background
  },

  // Color configuration (single mode)
  COLORS: {
    BACKGROUND: '#99bdc6', // sticker background behind QR (and QR background when no image)
    DOTS: '#2c3239', // QR dots/modules
    CORNERS: '#2c3239', // Finder/alignment corners
    BORDER: '#2c3239', // Outer frame
  },

  // QR Styling (qr-code-styling)
  QR_STYLING: {
    WIDTH: 300,
    HEIGHT: 300,
    MARGIN: 0,
    APPROX_MODULES: 33,
    DOTS: {
      TYPE: 'rounded' as const,
      COLOR: '#2c3239',
    },
    CORNERS: {
      COLOR: '#2c3239',
    },
    BACKGROUND: {
      COLOR: '#99bdc6',
    },
    IMAGE: {
      HIDE_BACKGROUND_DOTS: true,
      SIZE: 0.4,
      MARGIN: 0.05,
      CROSS_ORIGIN: 'anonymous' as const,
      SAVE_AS_BLOB: true,
    },
    QR_OPTIONS: {
      ERROR_CORRECTION: 'Q' as const,
      MODE: 'Byte' as const,
    },
  },

  // Frame and branding
  FRAME: {
    PADDING_PX: 8,
    RADIUS_PX: 12,
    COLOR: '#2c3239',
    OUTER_STROKE_PX: 10,
    OUTER_INNER_STROKE_PX: 4,
  },

  BRAND: {
    TEXT: 'peakbook',
    FONT_SIZE_PX: 12,
    FONT_FAMILY: '"Noto Naskh Arabic", Arial, sans-serif',
    FONT_WEIGHT: '700',
    COLOR: '#2c3239',
    MARGIN_FROM_QR: 4,
  },

  // Logo Overlay Configuration
  LOGO: {
    MAX_SIZE_PERCENT: 25, // 25% of QR width (per QR spec recommendations)
    SIZE_PX: 38, // ~1cm at 96 DPI
    BACKGROUND_PADDING: 4, // White background padding around logo
    SHADOW_BLUR: 2, // Drop shadow blur radius
    SHADOW_OPACITY: 0.15, // Drop shadow opacity
  },

  // Caption Configuration
  CAPTION: {
    MAX_LENGTH: 50, // Maximum caption characters
    FONT_SIZE_PX: 11, // Font size in pixels
    FONT_FAMILY: '"Noto Naskh Arabic", Arial, sans-serif', // Match logo font
    FONT_WEIGHT: '600', // Semi-bold weight
    COLOR: '#1f2937', // Dark gray (Tailwind gray-800)
    MARGIN_FROM_QR: 8, // Space between QR and caption
    MARGIN_FROM_BOTTOM: 12, // Space from sticker bottom edge
  },

  // Export Configuration
  EXPORT: {
    SVG_FILENAME_TEMPLATE: 'peakbook-qr-{token}.svg',
    SVG_NAMESPACE: 'http://www.w3.org/2000/svg',
    SVG_XLINK_NAMESPACE: 'http://www.w3.org/1999/xlink',
    PRINT_DPI: 300, // Recommended DPI for professional printing
  },

  // UI Configuration
  UI: {
    PREVIEW_SIZE_PX: 280, // Preview display size
    ZOOM_SCALE: 1.5, // Click-to-zoom scale factor
    DEBOUNCE_MS: 300, // Input debounce delay
    ANIMATION_DURATION: 200, // CSS transition duration
    TOAST_DURATION: 3000, // Toast notification duration
  },

  // Validation Messages
  MESSAGES: {
    TOKEN_INVALID_LENGTH: 'Token must be exactly 20 characters long',
    TOKEN_INVALID_CHARS:
      'Token can only contain uppercase letters (A-Z) and numbers (0-9)',
    TOKEN_REQUIRED: 'Token is required',
    CAPTION_TOO_LONG: 'Caption cannot exceed 50 characters',
    QR_GENERATION_FAILED: 'Failed to generate QR code. Please try again.',
    URL_INVALID: 'Generated URL is invalid',
    DOWNLOAD_FAILED: 'Failed to download file. Please try again.',
    STICKER_GENERATED: 'Sticker generated successfully!',
    FILE_DOWNLOADED: 'SVG file downloaded successfully!',
  },

  // Assets (single mode)
  ASSETS: {
    CENTER_ICON: '/icons/appicon.light.svg',
  },

  // Development flags
  DEBUG: process.env.NODE_ENV === 'development',
  INCLUDE_TRIM_MARKS: false, // Include trim marks in SVG (for professional printing)
} as const;

// Utility functions for configuration
export const QRConfigUtils = {
  /**
   * Validate token format
   */
  validateToken(token: string): { valid: boolean; error?: string } {
    if (!token) {
      return { valid: false, error: QR_CONFIG.MESSAGES.TOKEN_REQUIRED };
    }

    if (token.length !== QR_CONFIG.TOKEN_LENGTH) {
      return { valid: false, error: QR_CONFIG.MESSAGES.TOKEN_INVALID_LENGTH };
    }

    if (!QR_CONFIG.TOKEN_PATTERN.test(token)) {
      return { valid: false, error: QR_CONFIG.MESSAGES.TOKEN_INVALID_CHARS };
    }

    return { valid: true };
  },

  /**
   * Build URL with parameters
   */
  buildURL(token: string, paramName: string = QR_CONFIG.DEFAULT_PARAM_NAME): string {
    return `${QR_CONFIG.BASE_URL}?${paramName}=${token}`;
  },

  /**
   * Generate filename for download
   */
  getFilename(token: string): string {
    return QR_CONFIG.EXPORT.SVG_FILENAME_TEMPLATE.replace('{token}', token);
  },

  /**
   * Convert pixels to millimeters (96 DPI)
   */
  pxToMm(pixels: number): number {
    return (pixels * 25.4) / 96;
  },

  /**
   * Convert millimeters to pixels (96 DPI)
   */
  mmToPx(mm: number): number {
    return (mm * 96) / 25.4;
  },

  /**
   * Get responsive preview size based on container
   */
  getPreviewSize(containerWidth: number): number {
    const maxSize = Math.min(containerWidth - 32, QR_CONFIG.UI.PREVIEW_SIZE_PX);
    return Math.max(200, maxSize); // Minimum 200px
  },

  /**
   * Check if QR data will fit within capacity limits
   */
  checkQRCapacity(
    data: string,
    eccLevel: 'L' | 'M' | 'Q' | 'H' = 'H'
  ): {
    withinLimit: boolean;
    nearLimit: boolean;
    dataLength: number;
    limit: number;
    percentUsed: number;
  } {
    const dataLength = data.length;

    // Approximate QR Code capacity limits by ECC level
    const capacityLimits = {
      L: 2953, // Low (7%)
      M: 2331, // Medium (15%)
      Q: 1663, // Quartile (25%)
      H: 1273, // High (30%)
    };

    const limit = capacityLimits[eccLevel] || capacityLimits.H;
    const warningThreshold = Math.floor(limit * 0.8); // 80% of limit

    return {
      withinLimit: dataLength <= limit,
      nearLimit: dataLength > warningThreshold,
      dataLength,
      limit,
      percentUsed: Math.round((dataLength / limit) * 100),
    };
  },

  /**
   * Log debug information if DEBUG is enabled
   */
  debug(message: string, data?: any): void {
    if (QR_CONFIG.DEBUG) {
      console.log(`[Peakbook QR] ${message}`, data || '');
    }
  },

  /**
   * Get error correction level description
   */
  getECCDescription(level: 'L' | 'M' | 'Q' | 'H'): string {
    const descriptions = {
      L: 'Low (7% recovery)',
      M: 'Medium (15% recovery)',
      Q: 'Quartile (25% recovery)',
      H: 'High (30% recovery)',
    };
    return descriptions[level] || descriptions.H;
  },
};

// Export types
export type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type QRConfig = typeof QR_CONFIG;
