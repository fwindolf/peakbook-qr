import type { QRErrorCorrectionLevel } from './config';

export interface QRGenerationOptions {
  eccLevel?: QRErrorCorrectionLevel;
  width?: number;
  colors?: {
    BACKGROUND?: string;
    DOTS?: string;
    CORNERS?: string;
  };
  paramName?: string;
}

export interface QRCapacityResult {
  withinLimit: boolean;
  nearLimit: boolean;
  dataLength: number;
  limit: number;
  percentUsed: number;
}

export interface QRValidationResult {
  valid: boolean;
  error?: string;
}

export interface QRModuleInfo {
  type: string;
  index: number;
  attributes: Record<string, string>;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface QRGenerationResult {
  svgString: string;
  svgElement: SVGElement;
  width: number;
  height: number;
  modules: QRModuleInfo[];
  data: string;
  options: any;
  capacity: QRCapacityResult;
  token?: string;
  url?: string;
  paramName?: string;
  validation?: {
    valid: boolean;
    url?: string;
    error?: string;
  };
}

export interface StickerOptions {
  includeTrimMarks?: boolean;
  rounded?: boolean;
  colors?: {
    BACKGROUND?: string;
    DOTS?: string;
    CORNERS?: string;
    BORDER?: string;
  };
}

export interface QRFormData {
  token: string;
  caption?: string;
  paramName?: string;
  eccLevel?: QRErrorCorrectionLevel;
  theme?: 'light' | 'dark';
}

export interface ValidationErrors {
  token?: string;
  caption?: string;
  paramName?: string;
  eccLevel?: string;
  url?: string;
}

export interface QRCodeRecord {
  id: string;
  peak_id?: string;
  token: string;
  caption?: string;
  svg_data?: string;
  created_at: string;
  updated_at?: string;
}
