# QR Code Migration Complete ✅

## Migration Summary

Successfully migrated the QR code generation functionality from Vite/Vanilla JS to Next.js 15 + TypeScript.

## What Was Migrated

### Core Modules (JavaScript → TypeScript)
- ✅ `src/config/constants.js` → `lib/qr/config.ts`
- ✅ `src/modules/validator.js` → `lib/qr/validator.ts`
- ✅ `src/modules/qrGenerator.js` → `lib/qr/generator.ts`
- ✅ `src/modules/svgBuilder.js` → `lib/qr/svg-builder.ts`
- ✅ Added `lib/qr/types.ts` for TypeScript type definitions

### New Next.js Structure
- ✅ Created `/app/(admin)/qr-codes` route
- ✅ Server actions in `app/(admin)/qr-codes/actions.ts`
- ✅ React components using shadcn/ui
- ✅ Integrated with existing admin dashboard

## File Structure

```
peakbook-admin/
├── app/
│   └── (admin)/
│       └── qr-codes/
│           ├── page.tsx              # Main QR codes page
│           ├── actions.ts            # Server actions for QR generation
│           └── qr-form.tsx           # Interactive QR form component
│
├── lib/
│   └── qr/
│       ├── config.ts                 # Configuration & constants
│       ├── types.ts                  # TypeScript type definitions
│       ├── validator.ts              # Input validation
│       ├── generator.ts              # QR code generation
│       └── svg-builder.ts            # SVG sticker composition
│
└── backup-qr-code/                   # Original Vite files (backup)
    ├── src/
    ├── index.html
    └── vite.config.js
```

## How to Use

### 1. Set Up Environment Variables

Update `.env.local` with your Supabase credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PEAKBOOK_URL=https://peakbook.app
```

### 2. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000/qr-codes

### 3. Generate QR Codes

1. Navigate to **QR Codes** in the admin sidebar
2. Enter a 20-character token (or generate random)
3. Optionally add a caption (max 50 chars)
4. Select error correction level (Q recommended)
5. Click "Generate QR Code"
6. Download the SVG sticker

## Features

### QR Code Specifications
- **Token Format**: 20 characters (A-Z, 0-9)
- **Sticker Size**: 5cm × 5cm
- **QR Code Size**: 4cm × 4cm
- **Bleed Margins**: 3mm (print-ready)
- **Error Correction**: Quartile (25% recovery) - recommended
- **Output Format**: SVG (vector, scalable)

### Design Elements
- Rounded corners with double border
- Centered logo overlay with shadow
- Optional caption text (top)
- "peakbook" branding (bottom)
- Color scheme: #99bdc6 (background), #2c3239 (dark elements)

### Interactive Features
- ✅ Real-time token validation
- ✅ Character counter for caption
- ✅ Random token generation
- ✅ Live SVG preview
- ✅ One-click download
- ✅ Error handling with toast notifications

## Technical Stack

### Dependencies Added
- `qrcode` - QR code generation library
- `qr-code-styling` - Styled QR codes with logo support
- `@types/qrcode` - TypeScript types

### Technologies Used
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: TailwindCSS
- **QR Generation**: qrcode + qr-code-styling
- **Notifications**: Sonner (toast)

## Server Actions

The QR generation uses Next.js Server Actions for secure server-side processing:

```typescript
// app/(admin)/qr-codes/actions.ts
'use server';

export async function generateQRCode(formData: QRFormData) {
  // 1. Validate input
  // 2. Generate QR code
  // 3. Create SVG sticker
  // 4. Return result
}
```

## Validation Rules

### Token Validation
- Exactly 20 characters
- Uppercase letters (A-Z) and numbers (0-9) only
- Auto-sanitization on input

### Caption Validation
- Optional field
- Maximum 50 characters
- No special characters that affect printing: `< > { } \`

### URL Validation
- Protocol: HTTPS only
- Domain: peakbook.app only
- Path: /scan only
- Format: `https://peakbook.app/scan?token={TOKEN}`

## QR Capacity Limits (by ECC Level)

| Level | Recovery | Max Capacity |
|-------|----------|--------------|
| L     | 7%       | 2953 chars   |
| M     | 15%      | 2331 chars   |
| Q     | 25%      | 1663 chars   |
| H     | 30%      | 1273 chars   |

## Future Enhancements

### Planned Features
- [ ] Save QR codes to Supabase database
- [ ] Link QR codes to specific peaks
- [ ] QR code history/management page
- [ ] Batch generation for multiple peaks
- [ ] Export to different formats (PNG, PDF)
- [ ] Print layout templates (multiple stickers per page)
- [ ] Analytics: track QR scans

### Database Integration
The following table structure is ready for integration:

```sql
-- qr_codes table (already defined in schema)
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY,
  peak_id UUID REFERENCES peaks(id),
  token TEXT UNIQUE NOT NULL,
  caption TEXT,
  svg_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

## Troubleshooting

### Common Issues

**Build errors with PostCSS:**
- Ensure `postcss.config.mjs` is used (not `.js`)
- Remove any old PostCSS configuration files

**QR code not generating:**
- Check browser console for errors
- Verify token is exactly 20 characters
- Check network tab for failed API calls

**Environment variables not loading:**
- Restart dev server after changing `.env.local`
- Ensure no quotes around values in `.env.local`

### Debug Mode

Enable debug logging in `lib/qr/config.ts`:

```typescript
DEBUG: true, // Shows detailed logs in browser console
```

## Backup & Rollback

Original Vite implementation backed up to:
```
backup-qr-code/
├── src/
├── index.html
└── vite.config.js
```

To rollback (not recommended):
1. Copy files from `backup-qr-code/` to project root
2. Reinstall Vite dependencies
3. Remove Next.js QR integration

## Testing Checklist

- [x] Token validation (real-time)
- [x] Random token generation
- [x] Caption input (with length counter)
- [x] ECC level selection
- [x] QR code generation
- [x] SVG preview display
- [x] SVG download
- [x] Error handling
- [ ] Integration with peaks (future)
- [ ] Database persistence (future)

## Documentation

- Main docs: `CLAUDE.md`
- API reference: See inline JSDoc comments in TypeScript files
- Component props: See TypeScript interfaces in `lib/qr/types.ts`

## Credits

- Original implementation: Vite + Vanilla JS
- Migrated to: Next.js 15 + TypeScript
- QR libraries: qrcode, qr-code-styling
- UI components: shadcn/ui

---

**Status**: ✅ Migration Complete and Working
**Date**: October 5, 2025
**Next Steps**: Test in production, add database integration
