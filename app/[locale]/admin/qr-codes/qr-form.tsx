'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { generateQRCodeForPeak, getPeaks } from './actions';
import { toast } from 'sonner';
import { QR_CONFIG } from '@/lib/qr/config';

interface Peak {
  id: string;
  name: string;
  altitude: number | null;
}

export function QRCodeForm() {
  const [peaks, setPeaks] = useState<Peak[]>([]);
  const [selectedPeakId, setSelectedPeakId] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPeaks, setIsLoadingPeaks] = useState(true);
  const [generatedSVG, setGeneratedSVG] = useState<string | null>(null);
  const [generatedURL, setGeneratedURL] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  useEffect(() => {
    loadPeaks();
  }, []);

  const loadPeaks = async () => {
    setIsLoadingPeaks(true);
    try {
      const data = await getPeaks();
      setPeaks(data);
    } catch (error) {
      toast.error('Failed to load peaks');
      console.error(error);
    } finally {
      setIsLoadingPeaks(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedPeakId) {
      toast.error('Please select a peak');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateQRCodeForPeak(selectedPeakId, caption);

      if (result.success && result.data) {
        setGeneratedSVG(result.data.svg);
        setGeneratedURL(result.data.url);
        setFilename(result.data.filename);
        toast.success('QR code generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate QR code');
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

  const selectedPeak = peaks.find((p) => p.id === selectedPeakId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Settings</CardTitle>
          <CardDescription>Select a peak to generate its QR code sticker</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Peak Selection */}
          <div className="space-y-2">
            <Label htmlFor="peak">Peak *</Label>
            <Select value={selectedPeakId} onValueChange={setSelectedPeakId} disabled={isLoadingPeaks}>
              <SelectTrigger id="peak">
                <SelectValue placeholder={isLoadingPeaks ? 'Loading peaks...' : 'Select a peak'} />
              </SelectTrigger>
              <SelectContent>
                {peaks.map((peak) => (
                  <SelectItem key={peak.id} value={peak.id}>
                    {peak.name} {peak.altitude ? `(${peak.altitude}m)` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPeak && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedPeak.name}
                {selectedPeak.altitude ? ` - ${selectedPeak.altitude}m` : ''}
              </p>
            )}
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Scan to check in!"
              maxLength={50}
            />
            <p className="text-sm text-muted-foreground">
              {caption?.length || 0} / {QR_CONFIG.CAPTION.MAX_LENGTH}
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {selectedPeakId
                ? 'A QR code will be generated or retrieved for this peak. Each peak has a unique QR code token.'
                : 'QR codes are automatically managed per peak. If a QR code exists, it will be reused.'}
            </AlertDescription>
          </Alert>

          {/* Generate Button */}
          <Button onClick={handleGenerate} disabled={!selectedPeakId || isGenerating} className="w-full" size="lg">
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
                <div dangerouslySetInnerHTML={{ __html: generatedSVG }} className="max-w-sm w-full" />
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
