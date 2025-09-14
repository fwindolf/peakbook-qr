import { CONFIG, ConfigUtils } from '../config/constants.js';

export class SVGBuilder {
    constructor() {
        this.config = CONFIG;
        this.utils = ConfigUtils;
        this.svgNS = this.config.EXPORT.SVG_NAMESPACE;
        this.xlinkNS = this.config.EXPORT.SVG_XLINK_NAMESPACE;
    }

    /**
     * Create complete sticker SVG with QR code, logo overlay, and caption
     * @param {Object} qrResult - QR generation result
     * @param {string} logoPath - Path to logo SVG
     * @param {string} caption - Caption text
     * @param {Object} options - Additional options
     * @returns {SVGElement} Complete sticker SVG
     */
    async createStickerSVG(qrResult, logoPath, caption, options = {}) {
        this.utils.debug('Creating sticker SVG', { logoPath, caption, options });

        try {
            // Create main SVG element
            const svg = this.createMainSVG(options);

            // Create definitions for reusable elements
            const defs = this.createDefs();
            svg.appendChild(defs);

            // Add background
            const background = this.createBackground();
            svg.appendChild(background);

            // Add trim marks if requested
            if (options.includeTrimMarks || this.config.INCLUDE_TRIM_MARKS) {
                const trimMarks = this.createTrimMarks();
                svg.appendChild(trimMarks);
            }

            // Create main content group (within safe area)
            const contentGroup = document.createElementNS(this.svgNS, 'g');
            contentGroup.setAttribute('id', 'sticker-content');

            // Add clipping path for rounded corners
            const clipPath = this.createClipPath();
            defs.appendChild(clipPath);
            if (options.rounded !== false) {
                contentGroup.setAttribute('clip-path', 'url(#sticker-clip)');
            }

            // Add framed layout (border + caption above + brand below + QR centered)
            const framed = await this.addFramedLayout(qrResult, caption || '', options.logoTheme);
            contentGroup.appendChild(framed);

            svg.appendChild(contentGroup);

            this.utils.debug('Sticker SVG created successfully');
            return svg;

        } catch (error) {
            this.utils.debug('SVG creation failed', error);
            throw new Error(`Failed to create sticker SVG: ${error.message}`);
        }
    }

    /**
     * Build framed layout: rounded border sized to dot width, caption above, brand below, QR centered
     * @param {Object} qrResult
     * @param {string} caption
     * @returns {Promise<SVGElement>}
     */
    async addFramedLayout(qrResult, caption, theme = 'light') {
        const group = document.createElementNS(this.svgNS, 'g');
        group.setAttribute('id', 'framed-layout');

        const bleed = this.config.STICKER.BLEED_PX;
        const size = this.config.STICKER.SIZE_PX;
        const innerX = bleed + this.config.FRAME.PADDING_PX;
        const innerY = bleed + this.config.FRAME.PADDING_PX;
        const innerW = size - this.config.FRAME.PADDING_PX * 2;
        const innerH = size - this.config.FRAME.PADDING_PX * 2;

        // Compute module size based on intended on-sticker QR size
        const qrTargetSize = this.config.QR.SIZE_PX;
        const approxModules = this.config.QR_STYLING.APPROX_MODULES || 33;
        const moduleSize = Math.max(1, Math.round(qrTargetSize / approxModules));

        // Border rectangle (stroke equals module size)
        const border = document.createElementNS(this.svgNS, 'rect');
        border.setAttribute('x', innerX);
        border.setAttribute('y', innerY);
        border.setAttribute('width', innerW);
        border.setAttribute('height', innerH);
        border.setAttribute('rx', this.config.FRAME.RADIUS_PX);
        border.setAttribute('ry', this.config.FRAME.RADIUS_PX);
        border.setAttribute('fill', '#ffffff');
        border.setAttribute('stroke', this.config.FRAME.COLOR);
        border.setAttribute('stroke-width', moduleSize);
        group.appendChild(border);

        // Text areas
        const captionHeight = caption ? this.config.CAPTION.FONT_SIZE_PX * 1.4 : 0;
        const brandHeight = this.config.BRAND.FONT_SIZE_PX * 1.4;
        const spacing = this.config.CAPTION.MARGIN_FROM_QR;

        // Available square area for QR between caption and brand
        const availableH = innerH - captionHeight - brandHeight - 2 * spacing - moduleSize; // keep a bit off stroke
        const availableW = innerW - moduleSize; // keep a bit off stroke
        const qrSize = Math.min(this.config.QR.SIZE_PX, availableH, availableW);

        // Caption (top, inside border)
        if (caption) {
            const t = document.createElementNS(this.svgNS, 'text');
            t.setAttribute('x', innerX + innerW / 2);
            t.setAttribute('y', innerY + moduleSize / 2 + captionHeight * 0.75);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('font-family', this.config.CAPTION.FONT_FAMILY);
            t.setAttribute('font-size', this.config.CAPTION.FONT_SIZE_PX);
            t.setAttribute('font-weight', this.config.CAPTION.FONT_WEIGHT);
            t.setAttribute('fill', this.config.CAPTION.COLOR);
            t.textContent = caption;
            group.appendChild(t);
        }

        // Add QR, centered between caption and brand
        const qrGroup = await this.addQRCode(qrResult);
        const qrX = innerX + (innerW - qrSize) / 2;
        const qrY = innerY + (caption ? captionHeight + spacing : moduleSize / 2) + (availableH - qrSize) / 2 + moduleSize / 2;
        qrGroup.setAttribute('transform', `translate(${qrX}, ${qrY})`);

        // Resize embedded qr to qrSize
        const qrEmbedded = qrGroup.querySelector('svg');
        if (qrEmbedded) {
            qrEmbedded.setAttribute('width', qrSize);
            qrEmbedded.setAttribute('height', qrSize);
        }
        group.appendChild(qrGroup);

        // Center logo overlay with margin; use opposite theme of selected
        const oppositeTheme = theme === 'dark' ? 'light' : 'dark';
        // Use brand logo in the center, not app icon
        const logoPath = this.config.LOGOS[oppositeTheme] || this.config.LOGOS.light;
        const logoGroup = await this.addLogoOverlay(logoPath, oppositeTheme);
        group.appendChild(logoGroup);

        // Brand (bottom, inside border)
        const brand = document.createElementNS(this.svgNS, 'text');
        brand.setAttribute('x', innerX + innerW / 2);
        brand.setAttribute('y', innerY + innerH - moduleSize / 2 - brandHeight * 0.3);
        brand.setAttribute('text-anchor', 'middle');
        brand.setAttribute('font-family', this.config.BRAND.FONT_FAMILY);
        brand.setAttribute('font-size', this.config.BRAND.FONT_SIZE_PX);
        brand.setAttribute('font-weight', this.config.BRAND.FONT_WEIGHT);
        brand.setAttribute('fill', this.config.BRAND.COLOR);
        brand.textContent = this.config.BRAND.TEXT;
        group.appendChild(brand);

        return group;
    }

    /**
     * Create main SVG container
     * @param {Object} options - Creation options
     * @returns {SVGElement} Main SVG element
     */
    createMainSVG(options = {}) {
        const svg = document.createElementNS(this.svgNS, 'svg');
        const totalSize = this.config.STICKER.TOTAL_SIZE_PX;

        svg.setAttribute('width', `${totalSize}`);
        svg.setAttribute('height', `${totalSize}`);
        svg.setAttribute('viewBox', `0 0 ${totalSize} ${totalSize}`);
        svg.setAttribute('xmlns', this.svgNS);
        svg.setAttribute('xmlns:xlink', this.xlinkNS);

        // Add metadata
        svg.setAttribute('data-generator', 'Peakbook QR Generator');
        svg.setAttribute('data-version', '1.0');
        svg.setAttribute('data-print-size', `${this.config.STICKER.SIZE_CM}cm`);
        svg.setAttribute('data-bleed', `${this.config.STICKER.BLEED_CM}cm`);

        // Add title and description for accessibility
        const title = document.createElementNS(this.svgNS, 'title');
        title.textContent = 'Peakbook QR Code Sticker';
        svg.appendChild(title);

        const desc = document.createElementNS(this.svgNS, 'desc');
        desc.textContent = `QR code sticker for Peakbook check-in, ${this.config.STICKER.SIZE_CM}cm × ${this.config.STICKER.SIZE_CM}cm with ${this.config.STICKER.BLEED_CM}cm bleed`;
        svg.appendChild(desc);

        return svg;
    }

    /**
     * Create SVG definitions section
     * @returns {SVGElement} Defs element
     */
    createDefs() {
        const defs = document.createElementNS(this.svgNS, 'defs');

        // Add drop shadow filter for logo
        const filter = this.createShadowFilter();
        defs.appendChild(filter);

        // Add gradient for potential future use
        const gradient = this.createGradient();
        defs.appendChild(gradient);

        return defs;
    }

    /**
     * Create drop shadow filter
     * @returns {SVGElement} Filter element
     */
    createShadowFilter() {
        const filter = document.createElementNS(this.svgNS, 'filter');
        filter.setAttribute('id', 'logo-shadow');
        filter.setAttribute('x', '-20%');
        filter.setAttribute('y', '-20%');
        filter.setAttribute('width', '140%');
        filter.setAttribute('height', '140%');

        // Gaussian blur for shadow
        const feGaussianBlur = document.createElementNS(this.svgNS, 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', this.config.LOGO.SHADOW_BLUR);
        feGaussianBlur.setAttribute('result', 'blur');

        // Offset shadow
        const feOffset = document.createElementNS(this.svgNS, 'feOffset');
        feOffset.setAttribute('in', 'blur');
        feOffset.setAttribute('dx', '0');
        feOffset.setAttribute('dy', '1');
        feOffset.setAttribute('result', 'offsetBlur');

        // Adjust shadow opacity
        const feComponentTransfer = document.createElementNS(this.svgNS, 'feComponentTransfer');
        feComponentTransfer.setAttribute('in', 'offsetBlur');
        feComponentTransfer.setAttribute('result', 'shadow');

        const feFuncA = document.createElementNS(this.svgNS, 'feFuncA');
        feFuncA.setAttribute('type', 'linear');
        feFuncA.setAttribute('slope', this.config.LOGO.SHADOW_OPACITY);

        feComponentTransfer.appendChild(feFuncA);

        // Merge with original
        const feMerge = document.createElementNS(this.svgNS, 'feMerge');

        const feMergeNode1 = document.createElementNS(this.svgNS, 'feMergeNode');
        feMergeNode1.setAttribute('in', 'shadow');

        const feMergeNode2 = document.createElementNS(this.svgNS, 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');

        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);

        filter.appendChild(feGaussianBlur);
        filter.appendChild(feOffset);
        filter.appendChild(feComponentTransfer);
        filter.appendChild(feMerge);

        return filter;
    }

    /**
     * Create gradient definition
     * @returns {SVGElement} Gradient element
     */
    createGradient() {
        const gradient = document.createElementNS(this.svgNS, 'radialGradient');
        gradient.setAttribute('id', 'logo-gradient');
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '50%');

        const stop1 = document.createElementNS(this.svgNS, 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#ffffff');
        stop1.setAttribute('stop-opacity', '1');

        const stop2 = document.createElementNS(this.svgNS, 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#ffffff');
        stop2.setAttribute('stop-opacity', '0.8');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);

        return gradient;
    }

    /**
     * Create background rectangle
     * @returns {SVGElement} Background rect
     */
    createBackground() {
        const rect = document.createElementNS(this.svgNS, 'rect');
        rect.setAttribute('id', 'background');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');
        rect.setAttribute('width', this.config.STICKER.TOTAL_SIZE_PX);
        rect.setAttribute('height', this.config.STICKER.TOTAL_SIZE_PX);
        rect.setAttribute('fill', '#FFFFFF');

        return rect;
    }

    /**
     * Create clipping path for rounded corners
     * @returns {SVGElement} ClipPath element
     */
    createClipPath() {
        const clipPath = document.createElementNS(this.svgNS, 'clipPath');
        clipPath.setAttribute('id', 'sticker-clip');

        const rect = document.createElementNS(this.svgNS, 'rect');
        const bleed = this.config.STICKER.BLEED_PX;
        const size = this.config.STICKER.SIZE_PX;

        rect.setAttribute('x', bleed);
        rect.setAttribute('y', bleed);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        rect.setAttribute('rx', this.config.STICKER.CORNER_RADIUS_PX);
        rect.setAttribute('ry', this.config.STICKER.CORNER_RADIUS_PX);

        clipPath.appendChild(rect);
        return clipPath;
    }

    /**
     * Create trim marks for professional printing
     * @returns {SVGElement} Trim marks group
     */
    createTrimMarks() {
        const group = document.createElementNS(this.svgNS, 'g');
        group.setAttribute('id', 'trim-marks');
        group.setAttribute('stroke', '#000000');
        group.setAttribute('stroke-width', '0.25');
        group.setAttribute('opacity', '0.5');
        group.setAttribute('fill', 'none');

        const bleed = this.config.STICKER.BLEED_PX;
        const size = this.config.STICKER.SIZE_PX;
        const markLength = 8;
        const markOffset = 2;

        // Corner trim marks
        const marks = [
            // Top-left corner
            { x1: bleed - markOffset, y1: bleed - markLength - markOffset, x2: bleed - markOffset, y2: bleed - markOffset },
            { x1: bleed - markLength - markOffset, y1: bleed - markOffset, x2: bleed - markOffset, y2: bleed - markOffset },

            // Top-right corner
            { x1: bleed + size + markOffset, y1: bleed - markLength - markOffset, x2: bleed + size + markOffset, y2: bleed - markOffset },
            { x1: bleed + size + markOffset, y1: bleed - markOffset, x2: bleed + size + markLength + markOffset, y2: bleed - markOffset },

            // Bottom-left corner
            { x1: bleed - markOffset, y1: bleed + size + markOffset, x2: bleed - markOffset, y2: bleed + size + markLength + markOffset },
            { x1: bleed - markLength - markOffset, y1: bleed + size + markOffset, x2: bleed - markOffset, y2: bleed + size + markOffset },

            // Bottom-right corner
            { x1: bleed + size + markOffset, y1: bleed + size + markOffset, x2: bleed + size + markOffset, y2: bleed + size + markLength + markOffset },
            { x1: bleed + size + markOffset, y1: bleed + size + markOffset, x2: bleed + size + markLength + markOffset, y2: bleed + size + markOffset }
        ];

        marks.forEach((mark, index) => {
            const line = document.createElementNS(this.svgNS, 'line');
            line.setAttribute('x1', mark.x1);
            line.setAttribute('y1', mark.y1);
            line.setAttribute('x2', mark.x2);
            line.setAttribute('y2', mark.y2);
            line.setAttribute('class', 'trim-mark');
            group.appendChild(line);
        });

        return group;
    }

    /**
     * Add QR code to sticker
     * @param {Object} qrResult - QR generation result
     * @returns {SVGElement} QR code group
     */
    async addQRCode(qrResult) {
        this.utils.debug('Adding QR code to sticker', { hasQrResult: !!qrResult, keys: Object.keys(qrResult) });

        const group = document.createElementNS(this.svgNS, 'g');
        group.setAttribute('id', 'qr-code');

        // Calculate position to center QR code
        const totalSize = this.config.STICKER.TOTAL_SIZE_PX;
        const qrSize = this.config.QR.SIZE_PX;
        const x = (totalSize - qrSize) / 2;
        const y = (totalSize - qrSize) / 2 - 8; // Slightly higher to accommodate caption

        group.setAttribute('transform', `translate(${x}, ${y})`);

        // Check if we have the SVG element
        if (!qrResult.svgElement) {
            this.utils.debug('No svgElement in qrResult, trying to create from string');

            if (qrResult.svgString) {
                // Parse SVG string directly
                const parser = new DOMParser();
                const doc = parser.parseFromString(qrResult.svgString, 'image/svg+xml');
                qrResult.svgElement = doc.documentElement;
                this.utils.debug('Created svgElement from string', { tagName: qrResult.svgElement.tagName });
            } else {
                throw new Error('No SVG element or string found in QR result');
            }
        }

        // Clone the QR SVG content
        const qrSvg = qrResult.svgElement;
        this.utils.debug('Working with QR SVG', { tagName: qrSvg.tagName, hasChildren: qrSvg.children.length });

        // Method: Embed the QR SVG directly and size it to our target
        try {
            const qrContent = qrSvg.cloneNode(true);

            // Ensure predictable sizing
            qrContent.setAttribute('width', qrSize);
            qrContent.setAttribute('height', qrSize);

            // Preserve or set viewBox for proper scaling
            const currentViewBox = qrSvg.getAttribute('viewBox');
            if (currentViewBox) {
                qrContent.setAttribute('viewBox', currentViewBox);
            } else {
                const currentWidth = parseInt(qrSvg.getAttribute('width')) || qrSize;
                const currentHeight = parseInt(qrSvg.getAttribute('height')) || qrSize;
                qrContent.setAttribute('viewBox', `0 0 ${currentWidth} ${currentHeight}`);
            }

            // Keep aspect ratio and center within the slot
            qrContent.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            // Append the full QR SVG so coordinates and sizing are preserved
            group.appendChild(qrContent);

            this.utils.debug('QR code added successfully');
            return group;

        } catch (error) {
            this.utils.debug('Error adding QR code', error);

            // Method 3: Fallback - create a simple placeholder
            const rect = document.createElementNS(this.svgNS, 'rect');
            rect.setAttribute('width', qrSize);
            rect.setAttribute('height', qrSize);
            rect.setAttribute('fill', '#000000');
            group.appendChild(rect);

            const text = document.createElementNS(this.svgNS, 'text');
            text.setAttribute('x', qrSize / 2);
            text.setAttribute('y', qrSize / 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', '#FFFFFF');
            text.setAttribute('font-size', '12');
            text.textContent = 'QR ERROR';
            group.appendChild(text);

            console.error('QR code generation failed, showing placeholder', error);
            return group;
        }
    }

    /**
     * Add logo overlay to center of QR code
     * @param {string} logoPath - Path to logo file
     * @param {string} theme - Logo theme (light/dark)
     * @returns {Promise<SVGElement>} Logo group
     */
    async addLogoOverlay(logoPath, theme = 'light') {
        const group = document.createElementNS(this.svgNS, 'g');
        group.setAttribute('id', 'logo-overlay');

        // Calculate center position
        const totalSize = this.config.STICKER.TOTAL_SIZE_PX;
        const logoSize = this.config.LOGO.SIZE_PX;
        const padding = this.config.LOGO.BACKGROUND_PADDING;
        const x = (totalSize - logoSize) / 2;
        const y = (totalSize - logoSize) / 2 - 8; // Match QR positioning

        // Add white rounded-rect background (quadratic with rounded corners)
        const bgRect = document.createElementNS(this.svgNS, 'rect');
        const bgSize = logoSize + padding * 2;
        bgRect.setAttribute('x', x - padding);
        bgRect.setAttribute('y', y - padding);
        bgRect.setAttribute('width', bgSize);
        bgRect.setAttribute('height', bgSize);
        bgRect.setAttribute('rx', Math.floor(bgSize * 0.18));
        bgRect.setAttribute('ry', Math.floor(bgSize * 0.18));
        bgRect.setAttribute('fill', '#FFFFFF');
        bgRect.setAttribute('filter', 'url(#logo-shadow)');
        group.appendChild(bgRect);

        // Try to load and embed the logo SVG
        try {
            const logoSvg = await this.loadLogoSVG(logoPath);
            if (logoSvg) {
                // Clone and resize logo
                const logo = logoSvg.cloneNode(true);
                logo.setAttribute('x', x);
                logo.setAttribute('y', y);
                logo.setAttribute('width', logoSize);
                logo.setAttribute('height', logoSize);
                group.appendChild(logo);
            } else {
                // Fallback: use image element
                const image = document.createElementNS(this.svgNS, 'image');
                image.setAttribute('x', x);
                image.setAttribute('y', y);
                image.setAttribute('width', logoSize);
                image.setAttribute('height', logoSize);
                image.setAttribute('href', logoPath);
                image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                group.appendChild(image);
            }
        } catch (error) {
            this.utils.debug('Logo loading failed, using fallback', error);

            // Simple fallback logo (circle with "P")
            const fallbackCircle = document.createElementNS(this.svgNS, 'circle');
            fallbackCircle.setAttribute('cx', x + logoSize / 2);
            fallbackCircle.setAttribute('cy', y + logoSize / 2);
            fallbackCircle.setAttribute('r', logoSize / 2 - 2);
            fallbackCircle.setAttribute('fill', '#2563eb');
            group.appendChild(fallbackCircle);

            const fallbackText = document.createElementNS(this.svgNS, 'text');
            fallbackText.setAttribute('x', x + logoSize / 2);
            fallbackText.setAttribute('y', y + logoSize / 2 + 4);
            fallbackText.setAttribute('text-anchor', 'middle');
            fallbackText.setAttribute('font-family', this.config.CAPTION.FONT_FAMILY);
            fallbackText.setAttribute('font-size', logoSize / 2);
            fallbackText.setAttribute('font-weight', 'bold');
            fallbackText.setAttribute('fill', '#FFFFFF');
            fallbackText.textContent = 'P';
            group.appendChild(fallbackText);
        }

        return group;
    }

    /**
     * Load SVG logo from path
     * @param {string} logoPath - Path to logo SVG
     * @returns {Promise<SVGElement|null>} Logo SVG element or null
     */
    async loadLogoSVG(logoPath) {
        try {
            const response = await fetch(logoPath);
            if (!response.ok) {
                throw new Error(`Failed to load logo: ${response.status}`);
            }

            const svgText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');

            const logoSvg = doc.documentElement;
            if (logoSvg && logoSvg.tagName === 'svg') {
                return logoSvg;
            }

            return null;
        } catch (error) {
            this.utils.debug('Logo SVG loading failed', error);
            return null;
        }
    }

    /**
     * Add caption text below QR code
     * @param {string} captionText - Caption to display
     * @returns {SVGElement} Caption text element
     */
    addCaption(captionText) {
        const text = document.createElementNS(this.svgNS, 'text');
        text.setAttribute('id', 'caption');

        const totalSize = this.config.STICKER.TOTAL_SIZE_PX;
        const x = totalSize / 2;
        const y = totalSize - this.config.STICKER.BLEED_PX - this.config.CAPTION.MARGIN_FROM_BOTTOM;

        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'alphabetic');
        text.setAttribute('font-family', this.config.CAPTION.FONT_FAMILY);
        text.setAttribute('font-size', this.config.CAPTION.FONT_SIZE_PX);
        text.setAttribute('font-weight', this.config.CAPTION.FONT_WEIGHT);
        text.setAttribute('fill', this.config.CAPTION.COLOR);

        // Handle long captions with text wrapping if needed
        if (captionText.length > 25) {
            // Split long caption into multiple lines
            const words = captionText.split(' ');
            const lines = [];
            let currentLine = '';

            words.forEach(word => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                if (testLine.length <= 25) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        lines.push(word);
                    }
                }
            });

            if (currentLine) {
                lines.push(currentLine);
            }

            // Create tspan elements for multiple lines
            lines.forEach((line, index) => {
                const tspan = document.createElementNS(this.svgNS, 'tspan');
                tspan.setAttribute('x', x);
                tspan.setAttribute('dy', index === 0 ? '0' : '1.2em');
                tspan.textContent = line;
                text.appendChild(tspan);
            });
        } else {
            text.textContent = captionText;
        }

        return text;
    }

    /**
     * Convert SVG element to string with proper XML declaration
     * @param {SVGElement} svgElement - SVG element to serialize
     * @returns {string} Complete SVG string
     */
    svgToString(svgElement) {
        // Add XML declaration and DOCTYPE
        const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
        const svgString = new XMLSerializer().serializeToString(svgElement);

        // Clean up and format the SVG string
        const cleanSvg = svgString
            .replace(/xmlns="[^"]*"/g, '') // Remove duplicate xmlns
            .replace('<svg', `<svg xmlns="${this.svgNS}" xmlns:xlink="${this.xlinkNS}"`);

        return `${xmlDeclaration}\n${cleanSvg}`;
    }

    /**
     * Optimize SVG by removing unnecessary attributes and cleaning up
     * @param {SVGElement} svgElement - SVG to optimize
     * @returns {SVGElement} Optimized SVG
     */
    optimizeSVG(svgElement) {
        const optimized = svgElement.cloneNode(true);

        // Remove unnecessary attributes
        const elementsToClean = optimized.querySelectorAll('*');
        elementsToClean.forEach(element => {
            // Remove empty attributes
            Array.from(element.attributes).forEach(attr => {
                if (!attr.value || attr.value.trim() === '') {
                    element.removeAttribute(attr.name);
                }
            });

            // Round numeric values to reduce file size
            ['x', 'y', 'width', 'height', 'cx', 'cy', 'r'].forEach(attr => {
                const value = element.getAttribute(attr);
                if (value && !isNaN(parseFloat(value))) {
                    const rounded = Math.round(parseFloat(value) * 100) / 100;
                    element.setAttribute(attr, rounded.toString());
                }
            });
        });

        return optimized;
    }

    /**
     * Create a preview-sized version of the sticker
     * @param {SVGElement} stickerSvg - Full sticker SVG
     * @param {number} previewSize - Preview size in pixels
     * @returns {SVGElement} Preview SVG
     */
    createPreviewSVG(stickerSvg, previewSize = 280) {
        const preview = stickerSvg.cloneNode(true);

        // Update dimensions for preview
        preview.setAttribute('width', previewSize);
        preview.setAttribute('height', previewSize);

        // Remove trim marks from preview
        const trimMarks = preview.querySelector('#trim-marks');
        if (trimMarks) {
            trimMarks.remove();
        }

        // Add preview-specific styling
        preview.setAttribute('style', 'border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);');

        return preview;
    }
}

// Export singleton instance
export const svgBuilder = new SVGBuilder();

if (CONFIG.DEBUG) {
    console.log('SVG Builder module loaded');
}