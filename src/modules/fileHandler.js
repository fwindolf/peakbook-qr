import { CONFIG, ConfigUtils } from '../config/constants.js';
import { validator } from './validator.js';

export class FileHandler {
  constructor() {
    this.config = CONFIG;
    this.utils = ConfigUtils;
    this.validator = validator;
  }

  /**
   * Download SVG file to user's device
   * @param {string} svgContent - SVG content as string
   * @param {string} filename - Desired filename
   * @param {Object} options - Download options
   * @returns {Promise<boolean>} Success status
   */
  async downloadSVG(svgContent, filename, options = {}) {
    try {
      this.utils.debug('Starting SVG download', {
        filename,
        size: svgContent.length,
      });

      // Validate filename
      const filenameValidation = this.validator.validateFilename(filename);
      const finalFilename = filenameValidation.sanitized;

      // Validate SVG content
      const svgValidation = this.validator.validateSVGContent(svgContent);
      if (!svgValidation.valid) {
        throw new Error(`Invalid SVG: ${svgValidation.issues.join(', ')}`);
      }

      // Create blob with proper MIME type
      const blob = new Blob([svgContent], {
        type: 'image/svg+xml;charset=utf-8',
      });

      // Create download using modern APIs
      if (window.showSaveFilePicker && options.useFilePicker !== false) {
        // Use File System Access API if available (modern browsers)
        await this.downloadWithFilePicker(blob, finalFilename);
      } else {
        // Fallback to traditional download
        this.downloadWithAnchor(blob, finalFilename);
      }

      this.utils.debug('SVG download completed', { filename: finalFilename });
      return true;
    } catch (error) {
      this.utils.debug('SVG download failed', error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Download using File System Access API (modern browsers)
   * @param {Blob} blob - File blob
   * @param {string} filename - Filename
   */
  async downloadWithFilePicker(blob, filename) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'SVG files',
            accept: {
              'image/svg+xml': ['.svg'],
            },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      // If user cancels or API fails, fall back to anchor method
      if (error.name !== 'AbortError') {
        this.utils.debug('File picker failed, using fallback', error);
      }
      this.downloadWithAnchor(blob, filename);
    }
  }

  /**
   * Download using anchor element (traditional method)
   * @param {Blob} blob - File blob
   * @param {string} filename - Filename
   */
  downloadWithAnchor(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    // Append to DOM, click, and remove
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Create and open print window with sticker
   * @param {string} svgContent - SVG content
   * @param {string} token - Token value for print title
   * @param {Object} options - Print options
   * @returns {Promise<Window>} Print window reference
   */
  async printSticker(svgContent, token, options = {}) {
    try {
      this.utils.debug('Creating print preview', { token });

      const printWindow = window.open('', '_blank', 'width=800,height=600');

      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups.');
      }

      const printHTML = this.generatePrintHTML(svgContent, token, options);
      printWindow.document.write(printHTML);
      printWindow.document.close();

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      };

      return printWindow;
    } catch (error) {
      this.utils.debug('Print preview failed', error);
      throw new Error(`Print preview failed: ${error.message}`);
    }
  }

  /**
   * Generate HTML for print preview
   * @param {string} svgContent - SVG content
   * @param {string} token - Token value
   * @param {Object} options - Print options
   * @returns {string} Complete HTML document
   */
  generatePrintHTML(svgContent, token, options = {}) {
    const title = options.title || `Peakbook QR Sticker - ${token}`;
    const showInstructions = options.showInstructions !== false;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, sans-serif;
            background: white;
            color: black;
        }

        .print-container {
            max-width: 100%;
            margin: 0 auto;
            text-align: center;
        }

        .sticker-wrapper {
            display: inline-block;
            margin: 20mm auto;
            padding: 5mm;
            border: 1px dashed #ccc;
            background: white;
        }

        .sticker-svg {
            width: 50mm !important;
            height: 50mm !important;
            display: block;
            margin: 0 auto;
        }

        .print-info {
            margin-top: 10mm;
            padding: 5mm;
            border: 1px solid #ddd;
            background: #f9f9f9;
            text-align: left;
            page-break-inside: avoid;
        }

        .print-info h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 18px;
        }

        .print-info ul, .print-info ol {
            margin: 8px 0;
            padding-left: 20px;
            line-height: 1.6;
        }

        .token-info {
            background: #e3f2fd;
            padding: 8px;
            border-radius: 4px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 14px;
        }

        .no-print {
            display: none;
        }

        @media print {
            body {
                background: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .sticker-wrapper {
                border: none;
                padding: 0;
                margin: 10mm auto;
            }

            .print-info {
                page-break-before: always;
            }

            .no-print {
                display: none !important;
            }

            button {
                display: none !important;
            }
        }

        @media screen {
            .print-container {
                padding: 20px;
            }

            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                background: #2563eb;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                z-index: 1000;
            }

            .print-button:hover {
                background: #1d4ed8;
            }
        }
    </style>
</head>
<body>
    <div class="print-container">
        <div class="sticker-wrapper">
            ${svgContent}
        </div>

        ${
          showInstructions
            ? `
        <div class="print-info">
            <h2>Sticker Information</h2>

            <div class="token-info">
                <strong>Token:</strong> ${token}<br>
                <strong>Size:</strong> 5cm × 5cm (with 3mm bleed)<br>
                <strong>Generated:</strong> ${new Date().toLocaleString()}
            </div>

            <h3>Printing Guidelines:</h3>
            <ol>
                <li>Print at 100% scale (no fit to page)</li>
                <li>Use high-quality print settings (300 DPI minimum)</li>
                <li>Print on white or light-colored stock</li>
                <li>For professional printing, inform printer of 3mm bleed margins</li>
                <li>Test scan the printed QR code before bulk production</li>
            </ol>

            <h3>Quality Check:</h3>
            <ul>
                <li>QR modules should be crisp and well-defined</li>
                <li>Logo should be centered and clearly visible</li>
                <li>Caption text should be readable</li>
                <li>No white gaps or lines within QR pattern</li>
                <li>Overall sticker should be 5cm × 5cm when trimmed</li>
            </ul>

            <h3>Usage:</h3>
            <ul>
                <li>Apply to clean, dry surfaces</li>
                <li>Ensure QR code is not damaged during application</li>
                <li>Test scanning from multiple angles and distances</li>
                <li>Keep spare stickers for replacements</li>
            </ul>
        </div>
        `
            : ''
        }
    </div>

    <button class="print-button no-print" onclick="window.print()">
        🖨 Print This Page
    </button>

    <script>
        // Auto-focus for better UX
        window.focus();

        // Handle print completion
        window.onbeforeprint = function() {
            console.log('Starting print...');
        };

        window.onafterprint = function() {
            console.log('Print dialog closed');
            // Optionally close window after print
            // setTimeout(() => window.close(), 1000);
        };

        // Keyboard shortcut
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
        });
    </script>
</body>
</html>
        `.trim();
  }

  /**
   * Copy SVG content to clipboard
   * @param {string} svgContent - SVG content to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(svgContent) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(svgContent);
        this.utils.debug('SVG copied to clipboard');
        return true;
      } else {
        // Fallback for older browsers
        return this.copyToClipboardFallback(svgContent);
      }
    } catch (error) {
      this.utils.debug('Clipboard copy failed', error);
      throw new Error(`Failed to copy to clipboard: ${error.message}`);
    }
  }

  /**
   * Fallback clipboard copy for older browsers
   * @param {string} content - Content to copy
   * @returns {boolean} Success status
   */
  copyToClipboardFallback(content) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const result = document.execCommand('copy');
      document.body.removeChild(textArea);

      return result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create data URL from SVG content
   * @param {string} svgContent - SVG content
   * @returns {string} Data URL
   */
  createDataURL(svgContent) {
    const encoded = encodeURIComponent(svgContent);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }

  /**
   * Export sticker as PNG (requires canvas conversion)
   * @param {string} svgContent - SVG content
   * @param {Object} options - Export options
   * @returns {Promise<string>} PNG data URL
   */
  async exportAsPNG(svgContent, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const size = options.size || this.config.EXPORT.PRINT_DPI;
        canvas.width = size;
        canvas.height = size;

        img.onload = () => {
          try {
            // Fill white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw SVG
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to PNG
            const pngDataURL = canvas.toDataURL('image/png', 1.0);
            resolve(pngDataURL);
          } catch (error) {
            reject(new Error(`PNG conversion failed: ${error.message}`));
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load SVG for PNG conversion'));
        };

        img.src = this.createDataURL(svgContent);
      } catch (error) {
        reject(new Error(`PNG export failed: ${error.message}`));
      }
    });
  }

  /**
   * Validate file size and warn if too large
   * @param {string} content - File content
   * @param {string} type - File type
   * @returns {Object} Size validation result
   */
  validateFileSize(content, type = 'svg') {
    const sizeBytes = new Blob([content]).size;
    const sizeMB = sizeBytes / (1024 * 1024);

    const limits = {
      svg: 5, // 5MB limit for SVG
      png: 50, // 50MB limit for PNG
    };

    const limit = limits[type] || limits.svg;

    return {
      sizeBytes,
      sizeMB: Math.round(sizeMB * 100) / 100,
      withinLimit: sizeMB <= limit,
      warning:
        sizeMB > limit
          ? `File size (${sizeMB.toFixed(1)}MB) exceeds recommended limit of ${limit}MB`
          : null,
    };
  }

  /**
   * Get file extension from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} File extension
   */
  getExtensionFromMimeType(mimeType) {
    const mimeMap = {
      'image/svg+xml': 'svg',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'application/pdf': 'pdf',
    };

    return mimeMap[mimeType] || 'svg';
  }

  /**
   * Check if browser supports File System Access API
   * @returns {boolean} Support status
   */
  supportsFilePicker() {
    return 'showSaveFilePicker' in window;
  }

  /**
   * Check if browser supports modern clipboard API
   * @returns {boolean} Support status
   */
  supportsClipboard() {
    return navigator.clipboard && navigator.clipboard.writeText;
  }

  /**
   * Get download capabilities of current browser
   * @returns {Object} Capability information
   */
  getDownloadCapabilities() {
    return {
      filePicker: this.supportsFilePicker(),
      clipboard: this.supportsClipboard(),
      popup: !!window.open,
      download: !!(document.createElement('a').download !== undefined),
    };
  }
}

// Export singleton instance
export const fileHandler = new FileHandler();

if (CONFIG.DEBUG) {
  console.log('File Handler module loaded');
}
