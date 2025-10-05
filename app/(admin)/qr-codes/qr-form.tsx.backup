'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { generateQRCode, validateToken, generateRandomToken } from './actions';
import { toast } from 'sonner';
import { QR_CONFIG } from '@/lib/qr/config';
import type { QRFormData, QRErrorCorrectionLevel } from '@/lib/qr/types';

export function QRCodeForm() {
  const [formData, setFormData] = useState<QRFormData>({
    token: '',
    caption: '',
    paramName: 'token',
    eccLevel: 'Q',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSVG, setGeneratedSVG] = useState<string | null>(null);
  const [generatedURL, setGeneratedURL] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [tokenHelp, setTokenHelp] = useState<string>('Enter a 20-character token');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTokenChange = async (value: string) => {
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 20);
    setFormData({ ...formData, token: sanitized });

    // Validate token
    const result = await validateToken(sanitized);
    setTokenHelp(result.helpText || '');
    if (result.error) {
      setErrors({ ...errors, token: result.error });
    } else {
      const newErrors = { ...errors };
      delete newErrors.token;
      setErrors(newErrors);
    }
  };

  const handleGenerateRandom = async () => {
    const token = await generateRandomToken();
    handleTokenChange(token);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrors({});

    try {
      const result = await generateQRCode(formData);

      if (result.success && result.data) {
        setGeneratedSVG(result.data.svg);
        setGeneratedURL(result.data.url);
        setFilename(result.data.filename);
        toast.success('QR code generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate QR code');
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedSVG || !filename) return;

    const blob = new Blob([generatedSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded successfully!');
  };

  const isFormValid = formData.token.length === 20 && !errors.token;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Settings</CardTitle>
          <CardDescription>Configure your QR code sticker parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Input */}
          <div className="space-y-2">
            <Label htmlFor="token">Token *</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                value={formData.token}
                onChange={(e) => handleTokenChange(e.target.value)}
                placeholder="ABCD1234EFGH5678IJKL"
                maxLength={20}
                className={errors.token ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateRandom}
                title="Generate random token"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <p className={`text-sm ${errors.token ? 'text-destructive' : 'text-muted-foreground'}`}>
              {tokenHelp}
            </p>
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input
              id="caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Scan to check in!"
              maxLength={50}
            />
            <p className="text-sm text-muted-foreground">
              {formData.caption?.length || 0} / {QR_CONFIG.CAPTION.MAX_LENGTH}
            </p>
          </div>

          {/* Error Correction Level */}
          <div className="space-y-2">
            <Label htmlFor="ecc">Error Correction Level</Label>
            <Select
              value={formData.eccLevel}
              onValueChange={(value) => setFormData({ ...formData, eccLevel: value as QRErrorCorrectionLevel })}
            >
              <SelectTrigger id="ecc">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7% recovery)</SelectItem>
                <SelectItem value="M">Medium (15% recovery)</SelectItem>
                <SelectItem value="Q">Quartile (25% recovery) - Recommended</SelectItem>
                <SelectItem value="H">High (30% recovery)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate QR Code'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            {generatedURL ? `URL: ${generatedURL}` : 'Generate a QR code to see preview'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedSVG ? (
            <div className="space-y-4">
              {/* SVG Preview */}
              <div className="flex justify-center bg-muted p-6 rounded-lg">
                <div
                  dangerouslySetInnerHTML={{ __html: generatedSVG }}
                  className="max-w-sm w-full"
                />
              </div>

              {/* Download Button */}
              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download SVG
              </Button>

              {/* Info */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sticker size: {QR_CONFIG.STICKER.SIZE_CM}cm × {QR_CONFIG.STICKER.SIZE_CM}cm
                  <br />
                  Print-ready with {QR_CONFIG.STICKER.BLEED_CM}cm bleed margins
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <p className="text-muted-foreground">No preview available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
