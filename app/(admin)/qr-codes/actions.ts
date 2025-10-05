'use server';

import { qrGenerator } from '@/lib/qr/generator';
import { svgBuilder } from '@/lib/qr/svg-builder';
import { qrValidator } from '@/lib/qr/validator';
import { QR_CONFIG, QRConfigUtils } from '@/lib/qr/config';
import type { QRFormData, QRErrorCorrectionLevel } from '@/lib/qr/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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

export async function getPeaks() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('peaks')
    .select('id, name, altitude')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching peaks:', error);
    return [];
  }

  return data || [];
}

export async function generateQRCodeForPeak(peakId: string, caption?: string) {
  const supabase = await getSupabaseServerClient();

  // Check if QR code already exists for this peak
  const { data: existingQR } = await supabase
    .from('qr_codes')
    .select('token')
    .eq('peak_id', peakId)
    .single();

  let token: string;

  if (existingQR) {
    // Use existing token
    token = existingQR.token;
  } else {
    // Generate new token
    token = await generateRandomToken();

    // Save to database
    const { error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        peak_id: peakId,
        token: token,
      });

    if (insertError) {
      console.error('Error saving QR code:', insertError);
      return {
        success: false,
        error: 'Failed to save QR code to database',
      };
    }
  }

  // Generate QR code with the token
  const formData: QRFormData = {
    token,
    caption: caption || '',
    paramName: 'token',
    eccLevel: 'Q',
  };

  return generateQRCode(formData);
}
