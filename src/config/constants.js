export const CONFIG = {
    // URL Configuration
    BASE_URL: 'https://peakbook.app/scan',
    DEFAULT_PARAM_NAME: 'token',

    // Token Configuration
    TOKEN_LENGTH: 20,
    TOKEN_PATTERN: /^[A-Z0-9]{20}$/,

    // Sticker Dimensions (in pixels at 96 DPI)
    STICKER: {
        SIZE_CM: 5,                    // 5cm × 5cm
        SIZE_PX: 189,                  // 5cm at 96 DPI (189px)
        BLEED_CM: 0.3,                 // 3mm bleed
        BLEED_PX: 11,                  // 3mm at 96 DPI
        TOTAL_SIZE_PX: 211,            // 189 + (11 * 2) = 211px including bleed
        CORNER_RADIUS_PX: 15,          // Rounded corners
        SAFE_MARGIN_PX: 12,            // Safe zone from edges
    },

    // QR Code Configuration
    QR: {
        SIZE_CM: 4,                    // 4cm QR code
        SIZE_PX: 151,                  // 4cm at 96 DPI (final printed size)
        ERROR_CORRECTION: 'Q',         // Use Q per design spec
        MARGIN: 0,                     // No built-in margin (we handle positioning)
        COLOR_DARK: '#000000',         // Black QR modules
        COLOR_LIGHT: '#FFFFFF',        // White background
    },

    // QR Styling (qr-code-styling)
    QR_STYLING: {
        WIDTH: 300,
        HEIGHT: 300,
        MARGIN: 0,
        APPROX_MODULES: 33,
        DOTS: {
            TYPE: 'rounded',
            COLOR: '#2c3239'
        },
        CORNERS: {
            COLOR: '#2c3239'
        },
        BACKGROUND: {
            COLOR: '#ffffff'
        },
        IMAGE: {
            HIDE_BACKGROUND_DOTS: true,
            SIZE: 0.4,
            MARGIN: 0.05,
            CROSS_ORIGIN: 'anonymous',
            SAVE_AS_BLOB: true
        },
        QR_OPTIONS: {
            ERROR_CORRECTION: 'Q',
            MODE: 'Byte'
        }
    },

    // Frame and branding
    FRAME: {
        PADDING_PX: 8,
        RADIUS_PX: 12,
        COLOR: '#2c3239'
    },

    BRAND: {
        TEXT: 'peakbook',
        FONT_SIZE_PX: 12,
        FONT_FAMILY: '"Noto Naskh Arabic", Arial, sans-serif',
        FONT_WEIGHT: '700',
        COLOR: '#2c3239',
        MARGIN_FROM_QR: 4
    },

    // Logo Overlay Configuration
    LOGO: {
        MAX_SIZE_PERCENT: 25,          // 25% of QR width (per QR spec recommendations)
        SIZE_PX: 38,                   // ~1cm at 96 DPI
        BACKGROUND_PADDING: 4,         // White background padding around logo
        SHADOW_BLUR: 2,                // Drop shadow blur radius
        SHADOW_OPACITY: 0.15,          // Drop shadow opacity
    },

    // Caption Configuration
    CAPTION: {
        MAX_LENGTH: 50,                // Maximum caption characters
        FONT_SIZE_PX: 11,             // Font size in pixels
        FONT_FAMILY: '"Noto Naskh Arabic", Arial, sans-serif', // Match logo font
        FONT_WEIGHT: '600',            // Semi-bold weight
        COLOR: '#1f2937',              // Dark gray (Tailwind gray-800)
        MARGIN_FROM_QR: 8,            // Space between QR and caption
        MARGIN_FROM_BOTTOM: 12,       // Space from sticker bottom edge
    },

    // Export Configuration
    EXPORT: {
        SVG_FILENAME_TEMPLATE: 'peakbook-qr-{token}.svg',
        SVG_NAMESPACE: 'http://www.w3.org/2000/svg',
        SVG_XLINK_NAMESPACE: 'http://www.w3.org/1999/xlink',
        PRINT_DPI: 300,               // Recommended DPI for professional printing
    },

    // UI Configuration
    UI: {
        PREVIEW_SIZE_PX: 280,         // Preview display size
        ZOOM_SCALE: 1.5,              // Click-to-zoom scale factor
        DEBOUNCE_MS: 300,             // Input debounce delay
        ANIMATION_DURATION: 200,      // CSS transition duration
        TOAST_DURATION: 3000,         // Toast notification duration
    },

    // Validation Messages
    MESSAGES: {
        TOKEN_INVALID_LENGTH: 'Token must be exactly 20 characters long',
        TOKEN_INVALID_CHARS: 'Token can only contain uppercase letters (A-Z) and numbers (0-9)',
        TOKEN_REQUIRED: 'Token is required',
        CAPTION_TOO_LONG: 'Caption cannot exceed 50 characters',
        QR_GENERATION_FAILED: 'Failed to generate QR code. Please try again.',
        URL_INVALID: 'Generated URL is invalid',
        DOWNLOAD_FAILED: 'Failed to download file. Please try again.',
        STICKER_GENERATED: 'Sticker generated successfully!',
        FILE_DOWNLOADED: 'SVG file downloaded successfully!',
    },

    // Logo Paths (relative to public directory)
    LOGOS: {
        light: '/icons/appicon.light.svg',
        dark: '/icons/appicon.dark.svg'
    },

    // Development flags
    DEBUG: true,                     // Force debug mode for troubleshooting
    INCLUDE_TRIM_MARKS: false,       // Include trim marks in SVG (for professional printing)
};

// Utility functions for configuration
export const ConfigUtils = {
    /**
     * Get logo path for theme
     * @param {string} theme - light or dark
     * @returns {string} Logo path
     */
    getLogoPath(theme) {
        return CONFIG.LOGOS[theme] || CONFIG.LOGOS.light;
    },

    /**
     * Validate token format
     * @param {string} token - Token to validate
     * @returns {Object} Validation result
     */
    validateToken(token) {
        if (!token) {
            return { valid: false, error: CONFIG.MESSAGES.TOKEN_REQUIRED };
        }

        if (token.length !== CONFIG.TOKEN_LENGTH) {
            return { valid: false, error: CONFIG.MESSAGES.TOKEN_INVALID_LENGTH };
        }

        if (!CONFIG.TOKEN_PATTERN.test(token)) {
            return { valid: false, error: CONFIG.MESSAGES.TOKEN_INVALID_CHARS };
        }

        return { valid: true };
    },

    /**
     * Build URL with parameters
     * @param {string} token - The token value
     * @param {string} paramName - Parameter name (defaults to 'token')
     * @returns {string} Complete URL
     */
    buildURL(token, paramName = null) {
        const param = paramName || CONFIG.DEFAULT_PARAM_NAME;
        return `${CONFIG.BASE_URL}?${param}=${token}`;
    },

    /**
     * Generate filename for download
     * @param {string} token - The token value
     * @returns {string} Filename
     */
    getFilename(token) {
        return CONFIG.EXPORT.SVG_FILENAME_TEMPLATE.replace('{token}', token);
    },

    /**
     * Convert pixels to millimeters (96 DPI)
     * @param {number} pixels - Pixels to convert
     * @returns {number} Millimeters
     */
    pxToMm(pixels) {
        return (pixels * 25.4) / 96;
    },

    /**
     * Convert millimeters to pixels (96 DPI)
     * @param {number} mm - Millimeters to convert
     * @returns {number} Pixels
     */
    mmToPx(mm) {
        return (mm * 96) / 25.4;
    },

    /**
     * Get responsive preview size based on container
     * @param {number} containerWidth - Container width in pixels
     * @returns {number} Optimal preview size
     */
    getPreviewSize(containerWidth) {
        const maxSize = Math.min(containerWidth - 32, CONFIG.UI.PREVIEW_SIZE_PX);
        return Math.max(200, maxSize); // Minimum 200px
    },

    /**
     * Check if QR data will fit within capacity limits
     * @param {string} data - Data to encode
     * @param {string} eccLevel - Error correction level
     * @returns {Object} Capacity check result
     */
    checkQRCapacity(data, eccLevel = 'H') {
        const dataLength = data.length;

        // Approximate QR Code capacity limits by ECC level
        const capacityLimits = {
            L: 2953, // Low (7%)
            M: 2331, // Medium (15%)
            Q: 1663, // Quartile (25%)
            H: 1273  // High (30%)
        };

        const limit = capacityLimits[eccLevel] || capacityLimits.H;
        const warningThreshold = Math.floor(limit * 0.8); // 80% of limit

        return {
            withinLimit: dataLength <= limit,
            nearLimit: dataLength > warningThreshold,
            dataLength,
            limit,
            percentUsed: Math.round((dataLength / limit) * 100)
        };
    },

    /**
     * Log debug information if DEBUG is enabled
     * @param {string} message - Debug message
     * @param {any} data - Optional data to log
     */
    debug(message, data = null) {
        if (CONFIG.DEBUG) {
            console.log(`[Peakbook QR] ${message}`, data || '');
        }
    },

    /**
     * Get error correction level description
     * @param {string} level - ECC level (L, M, Q, H)
     * @returns {string} Description
     */
    getECCDescription(level) {
        const descriptions = {
            L: 'Low (7% recovery)',
            M: 'Medium (15% recovery)',
            Q: 'Quartile (25% recovery)',
            H: 'High (30% recovery)'
        };
        return descriptions[level] || descriptions.H;
    }
};

// Log configuration in debug mode
if (CONFIG.DEBUG) {
    console.log('Peakbook QR Generator Configuration:', CONFIG);
}