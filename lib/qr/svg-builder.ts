import { QR_CONFIG, QRConfigUtils } from './config';
import type { QRGenerationResult, StickerOptions } from './types';

export class SVGBuilder {
  private config = QR_CONFIG;
  private utils = QRConfigUtils;
  private svgNS = this.config.EXPORT.SVG_NAMESPACE;
  private xlinkNS = this.config.EXPORT.SVG_XLINK_NAMESPACE;

  /**
   * Create complete sticker SVG (browser environment)
   */
  async createStickerSVG(
    qrResult: QRGenerationResult,
    logoPath: string,
    caption: string,
    options: StickerOptions = {}
  ): Promise<string> {
    if (typeof document === 'undefined') {
      // Server-side: use template-based generation
      return this.createStickerSVGTemplate(qrResult, logoPath, caption, options);
    }

    // Browser-side: use DOM manipulation
    return this.createStickerSVGDOM(qrResult, logoPath, caption, options);
  }

  /**
   * Template-based SVG generation (works server-side)
   */
  private createStickerSVGTemplate(
    qrResult: QRGenerationResult,
    logoPath: string,
    caption: string,
    options: StickerOptions = {}
  ): string {
    const totalSize = this.config.STICKER.TOTAL_SIZE_PX;
    const bleed = this.config.STICKER.BLEED_PX;
    const size = this.config.STICKER.SIZE_PX;

    const innerX = bleed + this.config.FRAME.PADDING_PX;
    const innerY = bleed + this.config.FRAME.PADDING_PX;
    const innerW = size - this.config.FRAME.PADDING_PX * 2;
    const innerH = size - this.config.FRAME.PADDING_PX * 2;

    const qrSize = this.config.QR.SIZE_PX;
    const captionHeight = caption ? this.config.CAPTION.FONT_SIZE_PX * 1.4 : 0;
    const brandHeight = this.config.BRAND.FONT_SIZE_PX * 1.4;
    const spacing = this.config.CAPTION.MARGIN_FROM_QR;

    const qrX = innerX + (innerW - qrSize) / 2;
    const qrY = innerY + (caption ? captionHeight + spacing : this.config.FRAME.PADDING_PX);

    const logoSize = this.config.LOGO.SIZE_PX;
    const logoPadding = this.config.LOGO.BACKGROUND_PADDING;
    const logoX = (totalSize - logoSize) / 2;
    const logoY = (totalSize - logoSize) / 2;
    const bgSize = logoSize + logoPadding * 2;

    const svgParts: string[] = [];

    // XML declaration
    svgParts.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');

    // SVG root
    svgParts.push(
      `<svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" ` +
      `xmlns="${this.svgNS}" xmlns:xlink="${this.xlinkNS}" ` +
      `data-generator="Peakbook QR Generator" data-version="1.0">`
    );

    // Definitions
    svgParts.push('<defs>');
    svgParts.push(this.createShadowFilterTemplate());
    svgParts.push(this.createClipPathTemplate());
    svgParts.push('</defs>');

    // Background
    svgParts.push(
      `<rect x="0" y="0" width="${totalSize}" height="${totalSize}" fill="${this.config.COLORS.BACKGROUND}"/>`
    );

    // Outer borders
    const outerStroke = this.config.FRAME.OUTER_STROKE_PX;
    const innerStroke = this.config.FRAME.OUTER_INNER_STROKE_PX;
    const r = this.config.STICKER.CORNER_RADIUS_PX;

    svgParts.push(
      `<rect x="${outerStroke/2}" y="${outerStroke/2}" width="${totalSize - outerStroke}" height="${totalSize - outerStroke}" ` +
      `rx="${r}" ry="${r}" fill="none" stroke="#ffffff" stroke-width="${outerStroke}"/>`
    );

    const darkInset = outerStroke + innerStroke / 2;
    svgParts.push(
      `<rect x="${darkInset}" y="${darkInset}" width="${totalSize - darkInset * 2}" height="${totalSize - darkInset * 2}" ` +
      `rx="${r}" ry="${r}" fill="none" stroke="${this.config.COLORS.BORDER}" stroke-width="${innerStroke}"/>`
    );

    // Inner panel
    svgParts.push(
      `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" ` +
      `rx="${this.config.FRAME.RADIUS_PX}" ry="${this.config.FRAME.RADIUS_PX}" fill="${this.config.COLORS.BACKGROUND}"/>`
    );

    // Caption (if provided)
    if (caption) {
      const captionY = innerY + this.config.FRAME.PADDING_PX + captionHeight * 0.75;
      svgParts.push(
        `<text x="${innerX + innerW / 2}" y="${captionY}" text-anchor="middle" ` +
        `font-family="${this.config.CAPTION.FONT_FAMILY}" font-size="${this.config.CAPTION.FONT_SIZE_PX}" ` +
        `font-weight="${this.config.CAPTION.FONT_WEIGHT}" fill="${this.config.CAPTION.COLOR}">${this.escapeXml(caption)}</text>`
      );
    }

    // Embed QR code
    const qrSvg = qrResult.svgString
      .replace(/^<\?xml[^>]*\?>/, '')
      .replace(/<svg/, `<svg x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"`);
    svgParts.push(qrSvg);

    // Logo background
    svgParts.push(
      `<rect x="${logoX - logoPadding}" y="${logoY - logoPadding}" width="${bgSize}" height="${bgSize}" ` +
      `rx="${Math.floor(bgSize * 0.18)}" ry="${Math.floor(bgSize * 0.18)}" fill="#FFFFFF" filter="url(#logo-shadow)"/>`
    );

    // Logo (as image reference)
    svgParts.push(
      `<image x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" ` +
      `href="${logoPath}" preserveAspectRatio="xMidYMid meet"/>`
    );

    // Brand text
    const brandY = innerY + innerH - this.config.FRAME.PADDING_PX - brandHeight * 0.3;
    svgParts.push(
      `<text x="${innerX + innerW / 2}" y="${brandY}" text-anchor="middle" ` +
      `font-family="${this.config.BRAND.FONT_FAMILY}" font-size="${this.config.BRAND.FONT_SIZE_PX}" ` +
      `font-weight="${this.config.BRAND.FONT_WEIGHT}" fill="${this.config.COLORS.CORNERS}">${this.config.BRAND.TEXT}</text>`
    );

    svgParts.push('</svg>');

    return svgParts.join('\n');
  }

  /**
   * DOM-based SVG generation (browser only)
   */
  private async createStickerSVGDOM(
    qrResult: QRGenerationResult,
    logoPath: string,
    caption: string,
    options: StickerOptions = {}
  ): Promise<string> {
    const svg = document.createElementNS(this.svgNS, 'svg');
    const totalSize = this.config.STICKER.TOTAL_SIZE_PX;

    svg.setAttribute('width', `${totalSize}`);
    svg.setAttribute('height', `${totalSize}`);
    svg.setAttribute('viewBox', `0 0 ${totalSize} ${totalSize}`);
    svg.setAttribute('xmlns', this.svgNS);

    // Build SVG content...
    // (This is simplified - you can expand with full DOM manipulation if needed)

    return new XMLSerializer().serializeToString(svg);
  }

  /**
   * Create shadow filter template
   */
  private createShadowFilterTemplate(): string {
    return `
      <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="${this.config.LOGO.SHADOW_BLUR}" result="blur"/>
        <feOffset in="blur" dx="0" dy="1" result="offsetBlur"/>
        <feComponentTransfer in="offsetBlur" result="shadow">
          <feFuncA type="linear" slope="${this.config.LOGO.SHADOW_OPACITY}"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="shadow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;
  }

  /**
   * Create clip path template
   */
  private createClipPathTemplate(): string {
    const bleed = this.config.STICKER.BLEED_PX;
    const size = this.config.STICKER.SIZE_PX;
    const r = this.config.STICKER.CORNER_RADIUS_PX;

    return `
      <clipPath id="sticker-clip">
        <rect x="${bleed}" y="${bleed}" width="${size}" height="${size}" rx="${r}" ry="${r}"/>
      </clipPath>
    `;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Convert SVG element to string with proper XML declaration
   */
  svgToString(svgElement: SVGElement | string): string {
    if (typeof svgElement === 'string') {
      return svgElement;
    }

    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
    const svgString = new XMLSerializer().serializeToString(svgElement);

    return `${xmlDeclaration}\n${svgString}`;
  }

  /**
   * Create a preview-sized version of the sticker
   */
  createPreviewSVG(stickerSvg: string, previewSize = 280): string {
    return stickerSvg
      .replace(/width="\d+"/, `width="${previewSize}"`)
      .replace(/height="\d+"/, `height="${previewSize}"`);
  }
}

// Export singleton instance
export const svgBuilder = new SVGBuilder();
