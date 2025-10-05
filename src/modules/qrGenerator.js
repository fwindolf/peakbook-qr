import QRCode from 'qrcode';
import QRCodeStyling from 'qr-code-styling';
import { CONFIG, ConfigUtils } from '../config/constants.js';

export class QRGenerator {
    constructor() {
        this.config = CONFIG;
        this.utils = ConfigUtils;
    }

    /**
     * Generate QR code as SVG string
     * @param {string} data - Data to encode in QR code
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} QR generation result
     */
    async generateSVG(data, options = {}) {
        // Build qr-code-styling options
        const styling = this.config.QR_STYLING;
        const colors = { ...this.config.COLORS, ...(options.colors || {}) };
        // Background image removed; we use flat color for QR background

        const qrStylingOptions = {
            width: styling.WIDTH,
            height: styling.HEIGHT,
            type: 'svg',
            data,
            margin: styling.MARGIN,
            qrOptions: {
                errorCorrectionLevel: options.eccLevel || styling.QR_OPTIONS.ERROR_CORRECTION,
                mode: 'Byte'
            },
            imageOptions: {
                hideBackgroundDots: styling.IMAGE.HIDE_BACKGROUND_DOTS,
                imageSize: styling.IMAGE.SIZE,
                margin: styling.IMAGE.MARGIN,
                crossOrigin: styling.IMAGE.CROSS_ORIGIN,
                saveAsBlob: styling.IMAGE.SAVE_AS_BLOB
            },
            dotsOptions: {
                color: colors.DOTS,
                type: styling.DOTS.TYPE
            },
            backgroundOptions: {
                color: colors.BACKGROUND
            },
            // Set corners' colors only (no special shapes)
            cornersSquareOptions: {
                color: colors.CORNERS
            },
            cornersDotOptions: {
                color: colors.CORNERS
            }
        };

        try {
            this.utils.debug('Generating styled QR code', { data, qrStylingOptions });

            // Capacity check still applies
            const capacityCheck = this.utils.checkQRCapacity(data, qrStylingOptions.qrOptions.errorCorrectionLevel);
            if (!capacityCheck.withinLimit) {
                throw new Error(`Data too long for QR code (${capacityCheck.dataLength}/${capacityCheck.limit} chars)`);
            }

            const qr = new QRCodeStyling(qrStylingOptions);
            const blob = await qr.getRawData('svg');
            const svgText = await blob.text();

            const parsed = this.parseSVGString(svgText);

            return {
                svgString: svgText,
                svgElement: parsed.element,
                width: parsed.width,
                height: parsed.height,
                modules: parsed.modules,
                data,
                options: qrStylingOptions,
                capacity: capacityCheck
            };
        } catch (error) {
            this.utils.debug('Styled QR generation failed, falling back to basic', error);

            // Fallback to basic qrcode library
            const qrOptions = {
                type: 'svg',
                width: options.width || this.config.QR.SIZE_PX,
                margin: this.config.QR.MARGIN,
                color: {
                    dark: options.colorDark || this.config.QR.COLOR_DARK,
                    light: options.colorLight || this.config.QR.COLOR_LIGHT
                },
                errorCorrectionLevel: options.eccLevel || this.config.QR.ERROR_CORRECTION
            };
            const svgString = await QRCode.toString(data, qrOptions);
            const parsedSVG = this.parseSVGString(svgString);
            return {
                svgString,
                svgElement: parsedSVG.element,
                width: parsedSVG.width,
                height: parsedSVG.height,
                modules: parsedSVG.modules,
                data,
                options: qrOptions,
                capacity: this.utils.checkQRCapacity(data, qrOptions.errorCorrectionLevel)
            };
        }
    }

    /**
     * Generate QR code as Canvas (for preview purposes)
     * @param {string} data - Data to encode
     * @param {Object} options - Generation options
     * @returns {Promise<HTMLCanvasElement>} Canvas element
     */
    async generateCanvas(data, options = {}) {
        const canvas = document.createElement('canvas');

        const qrOptions = {
            ...options,
            margin: this.config.QR.MARGIN,
            width: options.width || this.config.UI.PREVIEW_SIZE_PX,
            errorCorrectionLevel: options.eccLevel || this.config.QR.ERROR_CORRECTION
        };

        try {
            await QRCode.toCanvas(canvas, data, qrOptions);
            return canvas;
        } catch (error) {
            this.utils.debug('Canvas QR generation failed', error);
            throw new Error(`Canvas QR generation failed: ${error.message}`);
        }
    }

    /**
     * Parse SVG string to extract element and metadata
     * @param {string} svgString - SVG as string
     * @returns {Object} Parsed SVG information
     */
    parseSVGString(svgString) {
        this.utils.debug('Parsing SVG string', { length: svgString.length, preview: svgString.substring(0, 200) });

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgElement = doc.documentElement;

        // Check for parsing errors
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
            this.utils.debug('SVG parsing error', parserError.textContent);
            throw new Error('Invalid SVG generated: ' + parserError.textContent);
        }

        // Ensure we have a valid SVG element
        if (!svgElement || svgElement.nodeName.toLowerCase() !== 'svg') {
            this.utils.debug('Invalid SVG element', svgElement);
            throw new Error('Generated content is not a valid SVG element');
        }

        // Extract dimensions
        const width = parseInt(svgElement.getAttribute('width')) || this.config.QR.SIZE_PX;
        const height = parseInt(svgElement.getAttribute('height')) || this.config.QR.SIZE_PX;

        this.utils.debug('SVG parsed successfully', { width, height, tagName: svgElement.tagName });

        // Extract QR modules (paths/rectangles that represent the QR pattern)
        const modules = this.extractQRModules(svgElement);

        const result = {
            element: svgElement.cloneNode(true),
            width,
            height,
            modules,
            viewBox: svgElement.getAttribute('viewBox')
        };

        this.utils.debug('SVG parsing result', { moduleCount: modules.length, viewBox: result.viewBox });

        return result;
    }

    /**
     * Extract QR module information from SVG
     * @param {SVGElement} svgElement - SVG element
     * @returns {Array} Array of module objects
     */
    extractQRModules(svgElement) {
        const modules = [];

        // Find all dark modules (paths or rectangles with dark fill)
        const darkElements = svgElement.querySelectorAll('path, rect, circle');

        darkElements.forEach((element, index) => {
            const fill = element.getAttribute('fill');

            if (fill === this.config.QR.COLOR_DARK || fill === '#000000' || fill === '#000') {
                modules.push({
                    type: element.tagName.toLowerCase(),
                    index,
                    attributes: this.getElementAttributes(element),
                    bounds: this.getElementBounds(element)
                });
            }
        });

        return modules;
    }

    /**
     * Get all attributes of an SVG element
     * @param {Element} element - SVG element
     * @returns {Object} Attributes as key-value pairs
     */
    getElementAttributes(element) {
        const attributes = {};

        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attributes[attr.name] = attr.value;
        }

        return attributes;
    }

    /**
     * Get bounding box of an SVG element
     * @param {Element} element - SVG element
     * @returns {Object} Bounding box information
     */
    getElementBounds(element) {
        try {
            if (element.getBBox) {
                const bbox = element.getBBox();
                return {
                    x: bbox.x,
                    y: bbox.y,
                    width: bbox.width,
                    height: bbox.height
                };
            }
        } catch (e) {
            // getBBox might fail in some cases
        }

        // Fallback: extract from attributes
        const attrs = this.getElementAttributes(element);
        return {
            x: parseFloat(attrs.x) || 0,
            y: parseFloat(attrs.y) || 0,
            width: parseFloat(attrs.width) || 0,
            height: parseFloat(attrs.height) || 0
        };
    }

    /**
     * Validate URL before QR generation
     * @param {string} url - URL to validate
     * @returns {Object} Validation result
     */
    validateURL(url) {
        try {
            const urlObj = new URL(url);

            // Check protocol
            if (urlObj.protocol !== 'https:') {
                return {
                    valid: false,
                    error: 'URL must use HTTPS protocol',
                    url
                };
            }

            // Check domain
            if (urlObj.hostname !== 'peakbook.app') {
                return {
                    valid: false,
                    error: 'URL must be for peakbook.app domain',
                    url
                };
            }

            // Check path
            if (urlObj.pathname !== '/scan') {
                return {
                    valid: false,
                    error: 'URL must use /scan path',
                    url
                };
            }

            return { valid: true, url };

        } catch (error) {
            return {
                valid: false,
                error: 'Invalid URL format',
                url
            };
        }
    }

    /**
     * Generate QR code with URL validation
     * @param {string} token - Token value
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} QR generation result
     */
    async generateFromToken(token, options = {}) {
        const paramName = options.paramName || this.config.DEFAULT_PARAM_NAME;
        const url = this.utils.buildURL(token, paramName);

        // Validate URL
        const urlValidation = this.validateURL(url);
        if (!urlValidation.valid) {
            throw new Error(urlValidation.error);
        }

        this.utils.debug('Generating QR from token', { token, url, options });

        // Generate QR code (colors may override defaults)
        const result = await this.generateSVG(url, { colors: options.colors });

        return {
            ...result,
            token,
            url,
            paramName,
            validation: urlValidation
        };
    }

    /**
     * Get QR code version and module count
     * @param {string} data - Data to encode
     * @param {string} eccLevel - Error correction level
     * @returns {Promise<Object>} Version information
     */
    async getQRVersion(data, eccLevel = 'H') {
        try {
            // Generate a minimal QR to get version info
            const canvas = document.createElement('canvas');
            await QRCode.toCanvas(canvas, data, {
                errorCorrectionLevel: eccLevel,
                margin: 0,
                width: 100
            });

            // QR versions: 1 = 21x21, 2 = 25x25, etc. (version = (modules - 17) / 4)
            const context = canvas.getContext('2d');
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // This is a simplified estimation
            const estimatedModules = Math.sqrt(imageData.data.length / 4);
            const version = Math.max(1, Math.round((estimatedModules - 17) / 4));

            return {
                version,
                modules: 17 + (version * 4),
                capacity: this.utils.checkQRCapacity(data, eccLevel)
            };

        } catch (error) {
            return {
                version: 1,
                modules: 21,
                capacity: this.utils.checkQRCapacity(data, eccLevel)
            };
        }
    }

    /**
     * Test if QR code can be generated with given parameters
     * @param {string} data - Data to test
     * @param {string} eccLevel - Error correction level
     * @returns {Promise<Object>} Test result
     */
    async testGeneration(data, eccLevel = 'H') {
        try {
            const result = await this.generateSVG(data, { eccLevel });
            return {
                success: true,
                result,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                result: null,
                error: error.message
            };
        }
    }

    /**
     * Get recommended error correction level based on use case
     * @param {boolean} hasLogo - Whether logo overlay will be used
     * @param {string} environment - Usage environment ('office', 'outdoor', 'mobile')
     * @returns {string} Recommended ECC level
     */
    getRecommendedECC(hasLogo = true, environment = 'office') {
        if (hasLogo) {
            return 'H'; // High correction needed for logo overlay
        }

        switch (environment) {
            case 'outdoor':
                return 'Q'; // Medium-high for weather resistance
            case 'mobile':
                return 'M'; // Medium for mobile scanning
            case 'office':
            default:
                return 'H'; // High for best reliability
        }
    }
}

// Export singleton instance
export const qrGenerator = new QRGenerator();

if (CONFIG.DEBUG) {
    console.log('QR Generator module loaded');
}