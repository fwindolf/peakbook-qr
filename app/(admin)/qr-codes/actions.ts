'use server';

import { qrGenerator } from '@/lib/qr/generator';
import { svgBuilder } from '@/lib/qr/svg-builder';
import { qrValidator } from '@/lib/qr/validator';
import { QR_CONFIG, QRConfigUtils } from '@/lib/qr/config';
import type { QRFormData, QRErrorCorrectionLevel } from '@/lib/qr/types';

export async function generateQRCode(formData: QRFormData) {
  try {
    // Validate input
    const validation = qrValidator.validateAll(formData);
    if (!validation.valid) {
      return {
        success: false,
        error: Object.values(validation.errors)[0] || 'Validation failed',
        errors: validation.errors,
      };
    }

    // Generate QR code
    const qrResult = await qrGenerator.generateFromToken(formData.token, {
      eccLevel: (formData.eccLevel || QR_CONFIG.QR.ERROR_CORRECTION) as QRErrorCorrectionLevel,
      paramName: formData.paramName || QR_CONFIG.DEFAULT_PARAM_NAME,
    });

    // Generate complete sticker SVG
    const logoPath = QR_CONFIG.ASSETS.CENTER_ICON;
    const stickerSvg = await svgBuilder.createStickerSVG(
      qrResult,
      logoPath,
      formData.caption || '',
      {
        includeTrimMarks: QR_CONFIG.INCLUDE_TRIM_MARKS,
        rounded: true,
      }
    );

    return {
      success: true,
      data: {
        svg: stickerSvg,
        token: formData.token,
        url: qrResult.url,
        filename: QRConfigUtils.getFilename(formData.token),
      },
    };
  } catch (error) {
    console.error('QR generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate QR code',
    };
  }
}

export async function validateToken(token: string) {
  const result = qrValidator.validateToken(token);
  return {
    valid: result.valid,
    error: result.error,
    helpText: qrValidator.getTokenHelpText(token),
  };
}

export async function generateRandomToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < QR_CONFIG.TOKEN_LENGTH; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
