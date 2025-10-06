import { QRCodeForm } from './qr-form';

export default function QRCodesPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate print-ready QR code stickers for peakbook check-ins
        </p>
      </div>

      <QRCodeForm />
    </div>
  );
}
