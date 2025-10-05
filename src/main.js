import './style.css';
import { CONFIG, ConfigUtils } from './config/constants.js';
import { Validator, validator } from './modules/validator.js';
import { QRGenerator, qrGenerator } from './modules/qrGenerator.js';
import { SVGBuilder, svgBuilder } from './modules/svgBuilder.js';
import { FileHandler, fileHandler } from './modules/fileHandler.js';

class PeakbookQRApp {
    constructor() {
        this.config = CONFIG;
        this.utils = ConfigUtils;
        this.validator = validator;
        this.qrGenerator = qrGenerator;
        this.svgBuilder = svgBuilder;
        this.fileHandler = fileHandler;

        // Application state
        this.currentToken = '';
        this.currentSVG = null;
        this.currentResult = null;
        this.debounceTimers = new Map();

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.utils.debug('Initializing Peakbook QR App');

            await this.bindElements();
            this.attachEventListeners();
            this.setupRealTimeValidation();
            this.loadSavedPreferences();
            this.checkBrowserCapabilities();

            this.utils.debug('App initialized successfully');
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('Application failed to initialize');
        }
    }

    /**
     * Bind DOM elements
     */
    async bindElements() {
        // Form elements
        this.form = document.getElementById('stickerForm');
        this.tokenInput = document.getElementById('tokenInput');
        this.captionInput = document.getElementById('captionInput');
        this.bgColorInput = document.getElementById('bgColor');
        this.dotsColorInput = document.getElementById('dotsColor');
        this.cornersColorInput = document.getElementById('cornersColor');
        this.paramNameInput = document.getElementById('paramName');
        this.eccLevelSelect = document.getElementById('eccLevel');
        this.logoThemeSelect = null;

        // Display elements
        this.previewContainer = document.getElementById('previewContainer');
        this.exportActions = document.getElementById('exportActions');
        this.urlDisplay = document.getElementById('urlDisplay');
        this.generatedUrl = document.getElementById('generatedUrl');

        // Status elements
        this.charCount = document.getElementById('charCount');
        this.tokenError = document.getElementById('tokenError');
        this.tokenHelp = document.getElementById('tokenHelp');

        // Buttons
        this.generateBtn = document.getElementById('generateBtn');
        this.generateBtnText = document.getElementById('generateBtnText');
        this.generateSpinner = document.getElementById('generateSpinner');
        this.downloadBtn = document.getElementById('downloadSvgBtn');
        this.printBtn = document.getElementById('printBtn');

        // Toast notifications
        this.successToast = document.getElementById('successToast');
        this.successMessage = document.getElementById('successMessage');
        this.errorToast = document.getElementById('errorToast');
        this.errorMessage = document.getElementById('errorMessage');

        // Verify all elements are found
        const requiredElements = [
            'form', 'tokenInput', 'captionInput', 'generateBtn', 'previewContainer'
        ];

        for (const elementName of requiredElements) {
            if (!this[elementName]) {
                throw new Error(`Required element not found: ${elementName}`);
            }
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateSticker();
        });

        // Token input with real-time formatting
        this.tokenInput.addEventListener('input', (e) => {
            const formatted = this.validator.formatTokenInput(e.target.value);
            if (e.target.value !== formatted) {
                e.target.value = formatted;
            }
            this.updateCharCount();
            this.debouncedValidateToken();
        });

        // Token input paste handling
        this.tokenInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                const formatted = this.validator.formatTokenInput(e.target.value);
                e.target.value = formatted;
                this.updateCharCount();
                this.debouncedValidateToken();
            }, 10);
        });

        // Export buttons
        this.downloadBtn?.addEventListener('click', () => {
            this.downloadSVG();
        });

        this.printBtn?.addEventListener('click', () => {
            this.printPreview();
        });

        // Preference saving
        [this.captionInput, this.paramNameInput, this.eccLevelSelect, this.bgColorInput, this.dotsColorInput, this.cornersColorInput].forEach(element => {
            if (element) {
                element.addEventListener('change', () => this.savePreferences());
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!this.generateBtn.disabled) {
                    this.generateSticker();
                }
            }
        });
    }

    /**
     * Setup real-time validation with debouncing
     */
    setupRealTimeValidation() {
        // Token validation with debounce
        this.debouncedValidateToken = this.debounce(() => {
            this.validateTokenRealTime();
        }, this.config.UI.DEBOUNCE_MS);

        // Caption validation
        this.captionInput?.addEventListener('input', this.debounce(() => {
            this.validateCaptionRealTime();
        }, this.config.UI.DEBOUNCE_MS));
    }

    /**
     * Update character count display
     */
    updateCharCount() {
        const count = this.tokenInput.value.length;
        const maxLength = this.config.TOKEN_LENGTH;

        if (this.charCount) {
            this.charCount.textContent = count;
        }

        // Update help text
        if (this.tokenHelp) {
            this.tokenHelp.textContent = this.validator.getTokenHelpText(this.tokenInput.value);
        }

        // Update visual state
        this.updateTokenInputState(count, maxLength);
    }

    /**
     * Update token input visual state
     */
    updateTokenInputState(count, maxLength) {
        const input = this.tokenInput;

        // Remove existing state classes
        input.classList.remove('input-error', 'input-success');

        if (count === maxLength) {
            const validation = this.validator.validateToken(input.value);
            if (validation.valid) {
                input.classList.add('input-success');
                this.generateBtn.disabled = false;
            } else {
                input.classList.add('input-error');
                this.generateBtn.disabled = true;
            }
        } else {
            this.generateBtn.disabled = true;
        }
    }

    /**
     * Real-time token validation
     */
    validateTokenRealTime() {
        const token = this.tokenInput.value;
        const validation = this.validator.validateToken(token);

        if (token.length > 0 && !validation.valid) {
            this.showTokenError(validation.error);
        } else {
            this.hideTokenError();
        }

        this.updateTokenInputState(token.length, this.config.TOKEN_LENGTH);
    }

    /**
     * Real-time caption validation
     */
    validateCaptionRealTime() {
        const caption = this.captionInput.value;
        const validation = this.validator.validateCaption(caption);

        if (!validation.valid) {
            this.captionInput.classList.add('input-error');
            // Could show caption error here if needed
        } else {
            this.captionInput.classList.remove('input-error');
        }
    }

    /**
     * Generate QR sticker
     */
    async generateSticker() {
        try {
            this.setLoadingState(true);
            this.utils.debug('Starting sticker generation');

            // Collect form data
            const formData = this.getFormData();
            this.utils.debug('Form data collected', formData);

            // Validate all inputs
            const validation = this.validator.validateAll(formData);
            this.utils.debug('Validation result', validation);
            if (!validation.valid) {
                const firstError = Object.values(validation.errors)[0];
                this.utils.debug('Validation failed', { firstError, allErrors: validation.errors });
                throw new Error(firstError);
            }

            this.utils.debug('Starting QR generation...');
            // Generate QR code
            const qrResult = await this.qrGenerator.generateFromToken(formData.token, {
                eccLevel: formData.eccLevel,
                paramName: formData.paramName,
                colors: formData.colors
            });
            this.utils.debug('QR generation completed', {
                hasResult: !!qrResult,
                hasSvgElement: !!qrResult.svgElement,
                hasSvgString: !!qrResult.svgString,
                url: qrResult.url
            });

            this.utils.debug('Starting SVG sticker creation...');
            // Build sticker SVG. Logo path no longer needed (center icon handled internally)
            const logoPath = null;
            this.utils.debug('Using logo path', logoPath);

            const stickerSvg = await this.svgBuilder.createStickerSVG(
                qrResult,
                logoPath,
                formData.caption,
                {
                    colors: formData.colors,
                    includeTrimMarks: this.config.INCLUDE_TRIM_MARKS
                }
            );
            this.utils.debug('SVG sticker created', { hasSticker: !!stickerSvg, tagName: stickerSvg?.tagName });

            // Store results
            this.currentToken = formData.token;
            this.currentSVG = stickerSvg;
            this.currentResult = {
                ...qrResult,
                formData,
                stickerSvg
            };

            this.utils.debug('Updating UI...');
            // Update UI
            this.displayPreview(stickerSvg);
            this.showGeneratedURL(qrResult.url);
            this.enableExportActions();

            // Save to history
            this.saveToHistory(formData);

            this.showSuccess(this.config.MESSAGES.STICKER_GENERATED);
            this.utils.debug('Sticker generated successfully');

        } catch (error) {
            console.error('Sticker generation failed:', error);
            this.utils.debug('Sticker generation failed', error);
            this.showError(error.message || 'Unknown error occurred');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Get form data as object
     */
    getFormData() {
        return {
            token: this.tokenInput.value,
            caption: this.captionInput.value || '',
            paramName: this.paramNameInput?.value || this.config.DEFAULT_PARAM_NAME,
            eccLevel: this.eccLevelSelect?.value || this.config.QR.ERROR_CORRECTION,
            colors: {
                BACKGROUND: this.bgColorInput?.value || this.config.COLORS.BACKGROUND,
                DOTS: this.dotsColorInput?.value || this.config.COLORS.DOTS,
                CORNERS: this.cornersColorInput?.value || this.config.COLORS.CORNERS,
                BORDER: this.config.COLORS.BORDER
            }
        };
    }

    /**
     * Display sticker preview
     */
    displayPreview(stickerSvg) {
        // Clear previous preview
        this.previewContainer.innerHTML = '';
        this.previewContainer.className = 'border-2 border-solid border-gray-200 rounded-lg p-4 min-h-[400px] flex items-center justify-center bg-white';

        // Create preview wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'flex justify-center items-center w-full';

        // Create preview SVG
        const previewSvg = this.svgBuilder.createPreviewSVG(stickerSvg, this.config.UI.PREVIEW_SIZE_PX);
        previewSvg.setAttribute('class', 'sticker-preview cursor-zoom-in max-w-full h-auto');

        // Add click-to-zoom functionality
        let isZoomed = false;
        previewSvg.addEventListener('click', () => {
            isZoomed = !isZoomed;
            if (isZoomed) {
                previewSvg.classList.add('zoomed');
                previewSvg.classList.remove('cursor-zoom-in');
                previewSvg.classList.add('cursor-zoom-out');
            } else {
                previewSvg.classList.remove('zoomed');
                previewSvg.classList.remove('cursor-zoom-out');
                previewSvg.classList.add('cursor-zoom-in');
            }
        });

        wrapper.appendChild(previewSvg);
        this.previewContainer.appendChild(wrapper);

        // Add fade-in animation
        wrapper.classList.add('animate-fade-in');
    }

    /**
     * Show generated URL
     */
    showGeneratedURL(url) {
        if (this.generatedUrl) {
            this.generatedUrl.textContent = url;
        }
        if (this.urlDisplay) {
            this.urlDisplay.classList.remove('hidden');
            this.urlDisplay.classList.add('animate-slide-up');
        }
    }

    /**
     * Enable export action buttons
     */
    enableExportActions() {
        if (this.exportActions) {
            this.exportActions.classList.remove('hidden');
            this.exportActions.classList.add('animate-slide-up');
        }
    }

    /**
     * Download SVG file
     */
    async downloadSVG() {
        if (!this.currentSVG || !this.currentToken) {
            this.showError('No sticker to download');
            return;
        }

        try {
            const filename = this.utils.getFilename(this.currentToken);
            const svgString = this.svgBuilder.svgToString(this.currentSVG);

            await this.fileHandler.downloadSVG(svgString, filename);
            this.showSuccess(this.config.MESSAGES.FILE_DOWNLOADED);

            // Track download
            this.trackEvent('download', { token: this.currentToken, filename });

        } catch (error) {
            this.utils.debug('Download failed', error);
            this.showError(error.message);
        }
    }

    /**
     * Open print preview
     */
    async printPreview() {
        if (!this.currentSVG || !this.currentToken) {
            this.showError('No sticker to print');
            return;
        }

        try {
            const svgString = this.svgBuilder.svgToString(this.currentSVG);
            await this.fileHandler.printSticker(svgString, this.currentToken);

            // Track print
            this.trackEvent('print', { token: this.currentToken });

        } catch (error) {
            this.utils.debug('Print preview failed', error);
            this.showError(error.message);
        }
    }

    /**
     * Set loading state
     */
    setLoadingState(loading) {
        if (loading) {
            this.generateBtn.disabled = true;
            this.generateBtn.classList.add('button-loading');
            this.generateBtnText?.classList.add('hidden');
            this.generateSpinner?.classList.remove('hidden');
        } else {
            this.generateBtn.disabled = false;
            this.generateBtn.classList.remove('button-loading');
            this.generateBtnText?.classList.remove('hidden');
            this.generateSpinner?.classList.add('hidden');
        }
    }

    /**
     * Show token error
     */
    showTokenError(message) {
        if (this.tokenError) {
            this.tokenError.textContent = message;
            this.tokenError.classList.remove('hidden');
        }
        this.tokenInput.classList.add('input-error');
    }

    /**
     * Hide token error
     */
    hideTokenError() {
        if (this.tokenError) {
            this.tokenError.classList.add('hidden');
        }
        this.tokenInput.classList.remove('input-error');
    }

    /**
     * Show success notification
     */
    showSuccess(message) {
        if (this.successMessage) {
            this.successMessage.textContent = message;
        }
        if (this.successToast) {
            this.successToast.classList.add('show');
            setTimeout(() => {
                this.successToast.classList.remove('show');
            }, this.config.UI.TOAST_DURATION);
        }
    }

    /**
     * Show error notification
     */
    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
        }
        if (this.errorToast) {
            this.errorToast.classList.add('show');
            setTimeout(() => {
                this.errorToast.classList.remove('show');
            }, this.config.UI.TOAST_DURATION);
        }
    }

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        try {
            const preferences = {
                caption: this.captionInput?.value || '',
                paramName: this.paramNameInput?.value || this.config.DEFAULT_PARAM_NAME,
                eccLevel: this.eccLevelSelect?.value || this.config.QR.ERROR_CORRECTION,
                colors: {
                    BACKGROUND: this.bgColorInput?.value || this.config.COLORS.BACKGROUND,
                    DOTS: this.dotsColorInput?.value || this.config.COLORS.DOTS,
                    CORNERS: this.cornersColorInput?.value || this.config.COLORS.CORNERS,
                    BORDER: this.config.COLORS.BORDER
                }
            };

            localStorage.setItem('peakbook-qr-preferences', JSON.stringify(preferences));
            this.utils.debug('Preferences saved', preferences);
        } catch (error) {
            this.utils.debug('Failed to save preferences', error);
        }
    }

    /**
     * Load saved preferences from localStorage
     */
    loadSavedPreferences() {
        try {
            const saved = localStorage.getItem('peakbook-qr-preferences');
            if (saved) {
                const preferences = JSON.parse(saved);

                if (preferences.caption && this.captionInput) {
                    this.captionInput.value = preferences.caption;
                }
                if (preferences.paramName && this.paramNameInput) {
                    this.paramNameInput.value = preferences.paramName;
                }
                if (preferences.eccLevel && this.eccLevelSelect) {
                    this.eccLevelSelect.value = preferences.eccLevel;
                }
                if (preferences.colors) {
                    this.bgColorInput && (this.bgColorInput.value = preferences.colors.BACKGROUND || this.config.COLORS.BACKGROUND);
                    this.dotsColorInput && (this.dotsColorInput.value = preferences.colors.DOTS || this.config.COLORS.DOTS);
                    this.cornersColorInput && (this.cornersColorInput.value = preferences.colors.CORNERS || this.config.COLORS.CORNERS);
                }

                this.utils.debug('Preferences loaded', preferences);
            }
        } catch (error) {
            this.utils.debug('Failed to load preferences', error);
        }
    }

    /**
     * Save generation to history
     */
    saveToHistory(formData) {
        try {
            const history = JSON.parse(localStorage.getItem('peakbook-qr-history') || '[]');

            const entry = {
                token: formData.token,
                caption: formData.caption,
                timestamp: new Date().toISOString(),
                url: this.currentResult.url
            };

            history.unshift(entry);

            // Keep only last 20 items
            history.splice(20);

            localStorage.setItem('peakbook-qr-history', JSON.stringify(history));
            this.utils.debug('Saved to history', entry);
        } catch (error) {
            this.utils.debug('Failed to save to history', error);
        }
    }

    /**
     * Check browser capabilities and show warnings if needed
     */
    checkBrowserCapabilities() {
        const capabilities = this.fileHandler.getDownloadCapabilities();

        if (!capabilities.download) {
            console.warn('Browser does not support modern download features');
        }

        if (!capabilities.clipboard) {
            this.utils.debug('Browser does not support modern clipboard API');
        }

        if (!capabilities.filePicker) {
            this.utils.debug('Browser does not support File System Access API');
        }
    }

    /**
     * Track user events (placeholder for analytics)
     */
    trackEvent(action, data) {
        if (this.config.DEBUG) {
            console.log('Track event:', action, data);
        }

        // Could integrate with analytics services here
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: 'QR Generator',
                event_label: data.token,
                value: 1
            });
        }
    }

    /**
     * Create debounced function
     */
    debounce(func, wait) {
        return (...args) => {
            const key = func.toString();
            clearTimeout(this.debounceTimers.get(key));
            this.debounceTimers.set(key, setTimeout(() => {
                func.apply(this, args);
            }, wait));
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Clear debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();

        // Remove event listeners would go here if needed
        this.utils.debug('App destroyed');
    }
}

// Initialize application when DOM is ready
function initApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.peakbookQR = new PeakbookQRApp();
        });
    } else {
        window.peakbookQR = new PeakbookQRApp();
    }
}

// Start the application
initApp();

// Export for potential external access
export default PeakbookQRApp;