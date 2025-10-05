import QRCode from 'qrcode';
import QRCodeStyling from 'qr-code-styling';
import { QR_CONFIG, QRConfigUtils } from './config';
import type {
  QRGenerationOptions,
  QRGenerationResult,
  QRModuleInfo,
  QRErrorCorrectionLevel,
} from './types';

export class QRGenerator {
  private config = QR_CONFIG;
  private utils = QRConfigUtils;

  /**
   * Generate QR code as SVG string
   */
  async generateSVG(data: string, options: QRGenerationOptions = {}): Promise<QRGenerationResult> {
    const styling = this.config.QR_STYLING;
    const colors = { ...this.config.COLORS, ...(options.colors || {}) };

    const qrStylingOptions = {
      width: styling.WIDTH,
      height: styling.HEIGHT,
      type: 'svg' as const,
      data,
      margin: styling.MARGIN,
      qrOptions: {
        errorCorrectionLevel: (options.eccLevel || styling.QR_OPTIONS.ERROR_CORRECTION) as QRErrorCorrectionLevel,
        mode: 'Byte' as const,
      },
      imageOptions: {
        hideBackgroundDots: styling.IMAGE.HIDE_BACKGROUND_DOTS,
        imageSize: styling.IMAGE.SIZE,
        margin: styling.IMAGE.MARGIN,
        crossOrigin: styling.IMAGE.CROSS_ORIGIN,
        saveAsBlob: styling.IMAGE.SAVE_AS_BLOB,
      },
      dotsOptions: {
        color: colors.DOTS,
        type: styling.DOTS.TYPE,
      },
      backgroundOptions: {
        color: colors.BACKGROUND,
      },
      cornersSquareOptions: {
        color: colors.CORNERS,
      },
      cornersDotOptions: {
        color: colors.CORNERS,
      },
    };

    try {
      this.utils.debug('Generating styled QR code', { data, qrStylingOptions });

      // Capacity check
      const capacityCheck = this.utils.checkQRCapacity(
        data,
        qrStylingOptions.qrOptions.errorCorrectionLevel
      );
      if (!capacityCheck.withinLimit) {
        throw new Error(
          `Data too long for QR code (${capacityCheck.dataLength}/${capacityCheck.limit} chars)`
        );
      }

      const qr = new QRCodeStyling(qrStylingOptions);
      const blob = await qr.getRawData('svg');
      if (!blob) {
        throw new Error('Failed to generate QR code blob');
      }
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
        capacity: capacityCheck,
      };
    } catch (error) {
      this.utils.debug('Styled QR generation failed, falling back to basic', error);

      // Fallback to basic qrcode library
      const qrOptions = {
        type: 'svg' as const,
        width: options.width || this.config.QR.SIZE_PX,
        margin: this.config.QR.MARGIN,
        color: {
          dark: this.config.QR.COLOR_DARK,
          light: this.config.QR.COLOR_LIGHT,
        },
        errorCorrectionLevel: (options.eccLevel || this.config.QR.ERROR_CORRECTION) as QRErrorCorrectionLevel,
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
        capacity: this.utils.checkQRCapacity(data, qrOptions.errorCorrectionLevel),
      };
    }
  }

  /**
   * Generate QR code as Canvas (for preview purposes - browser only)
   */
  async generateCanvas(data: string, options: QRGenerationOptions = {}): Promise<HTMLCanvasElement> {
    if (typeof document === 'undefined') {
      throw new Error('Canvas generation is only available in browser environment');
    }

    const canvas = document.createElement('canvas');

    const qrOptions = {
      ...options,
      margin: this.config.QR.MARGIN,
      width: options.width || this.config.UI.PREVIEW_SIZE_PX,
      errorCorrectionLevel: (options.eccLevel || this.config.QR.ERROR_CORRECTION) as QRErrorCorrectionLevel,
    };

    try {
      await QRCode.toCanvas(canvas, data, qrOptions);
      return canvas;
    } catch (error) {
      this.utils.debug('Canvas QR generation failed', error);
      throw new Error(`Canvas QR generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse SVG string to extract element and metadata
   */
  parseSVGString(svgString: string): {
    element: SVGElement;
    width: number;
    height: number;
    modules: QRModuleInfo[];
    viewBox?: string | null;
  } {
    this.utils.debug('Parsing SVG string', {
      length: svgString.length,
      preview: svgString.substring(0, 200),
    });

    if (typeof DOMParser === 'undefined') {
      throw new Error('DOMParser is not available in this environment');
    }

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
    const width = parseInt(svgElement.getAttribute('width') || '') || this.config.QR.SIZE_PX;
    const height = parseInt(svgElement.getAttribute('height') || '') || this.config.QR.SIZE_PX;

    this.utils.debug('SVG parsed successfully', {
      width,
      height,
      tagName: svgElement.tagName,
    });

    // Extract QR modules
    const modules = this.extractQRModules(svgElement);

    const result = {
      element: svgElement.cloneNode(true) as SVGElement,
      width,
      height,
      modules,
      viewBox: svgElement.getAttribute('viewBox'),
    };

    this.utils.debug('SVG parsing result', {
      moduleCount: modules.length,
      viewBox: result.viewBox,
    });

    return result;
  }

  /**
   * Extract QR module information from SVG
   */
  extractQRModules(svgElement: SVGElement): QRModuleInfo[] {
    const modules: QRModuleInfo[] = [];

    // Find all dark modules (paths or rectangles with dark fill)
    const darkElements = svgElement.querySelectorAll('path, rect, circle');

    darkElements.forEach((element, index) => {
      const fill = element.getAttribute('fill');

      if (
        fill === this.config.QR.COLOR_DARK ||
        fill === '#000000' ||
        fill === '#000'
      ) {
        modules.push({
          type: element.tagName.toLowerCase(),
          index,
          attributes: this.getElementAttributes(element),
          bounds: this.getElementBounds(element),
        });
      }
    });

    return modules;
  }

  /**
   * Get all attributes of an SVG element
   */
  getElementAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};

    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    return attributes;
  }

  /**
   * Get bounding box of an SVG element
   */
  getElementBounds(element: Element): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    try {
      const svgElement = element as SVGGraphicsElement;
      if (svgElement.getBBox) {
        const bbox = svgElement.getBBox();
        return {
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height,
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
      height: parseFloat(attrs.height) || 0,
    };
  }

  /**
   * Validate URL before QR generation
   */
  validateURL(url: string): { valid: boolean; error?: string; url: string } {
    try {
      const urlObj = new URL(url);

      // Check protocol
      if (urlObj.protocol !== 'https:') {
        return {
          valid: false,
          error: 'URL must use HTTPS protocol',
          url,
        };
      }

      // Check domain
      if (urlObj.hostname !== 'peakbook.app') {
        return {
          valid: false,
          error: 'URL must be for peakbook.app domain',
          url,
        };
      }

      // Check path
      if (urlObj.pathname !== '/scan') {
        return {
          valid: false,
          error: 'URL must use /scan path',
          url,
        };
      }

      return { valid: true, url };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format',
        url,
      };
    }
  }

  /**
   * Generate QR code with URL validation
   */
  async generateFromToken(token: string, options: QRGenerationOptions = {}): Promise<QRGenerationResult> {
    const paramName = options.paramName || this.config.DEFAULT_PARAM_NAME;
    const url = this.utils.buildURL(token, paramName);

    // Validate URL
    const urlValidation = this.validateURL(url);
    if (!urlValidation.valid) {
      throw new Error(urlValidation.error);
    }

    this.utils.debug('Generating QR from token', { token, url, options });

    // Generate QR code
    const result = await this.generateSVG(url, { colors: options.colors, eccLevel: options.eccLevel });

    return {
      ...result,
      token,
      url,
      paramName,
      validation: urlValidation,
    };
  }

  /**
   * Get recommended error correction level based on use case
   */
  getRecommendedECC(hasLogo = true, environment: 'office' | 'outdoor' | 'mobile' = 'office'): QRErrorCorrectionLevel {
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
