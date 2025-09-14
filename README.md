# Peakbook QR Sticker Generator

A modern web application for generating print-ready QR code stickers for Peakbook check-in. Built with Vite, vanilla JavaScript ES6 modules, and TailwindCSS.

## Features

✨ **Core Functionality**
- Generate QR codes for `https://peakbook.app/scan?token=...` URLs
- Professional print-ready SVG output (5cm × 5cm with 3mm bleed margins)
- Logo overlay with high error correction (25% of QR width)
- Customizable caption text below QR code
- Real-time token validation (20 characters, A-Z0-9)

🎨 **User Experience**
- Clean, responsive interface built with TailwindCSS
- Real-time preview with click-to-zoom
- One-click SVG download with proper naming
- Print preview with professional layout
- Toast notifications for user feedback
- LocalStorage for preferences and history

🔧 **Technical**
- Modern ES6 modules architecture
- No external CDN dependencies (fully bundled)
- Vite for development and optimized production builds
- Legacy browser support via Vite plugins
- Proper error correction for reliable scanning
- Vector SVG output for crisp printing at any size

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone or download this repository**
   ```bash
   cd peakbook-qr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Usage

### Generating a Sticker

1. **Enter Token**: Input a 20-character token (A-Z and 0-9 only)
2. **Customize Caption**: Edit the caption text (defaults to "Scan to check-in")
3. **Advanced Options**: Configure URL parameters, error correction level, and logo theme
4. **Generate**: Click "Generate Sticker" to create the preview
5. **Download**: Click "Download SVG" to save the print-ready file
6. **Print Test**: Use "Print Preview" to test on office printer

### Printing Guidelines

📋 **For Professional Printing:**
- File format: SVG (vector, scalable)
- Sticker size: 5cm × 5cm
- Bleed margins: 3mm (included in SVG)
- Print quality: 300 DPI minimum
- Material: High-quality vinyl with matte or gloss finish

📋 **Quality Control:**
- Test scan printed QR codes before bulk production
- Ensure QR modules are crisp and well-defined
- Verify logo is centered and clearly visible
- Check caption text readability
- Confirm proper trimming to 5cm × 5cm

## Architecture

### Project Structure
```
peakbook-qr/
├── index.html              # Main HTML entry
├── package.json           # Dependencies & scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind setup
├── postcss.config.js      # PostCSS configuration
├── src/
│   ├── main.js           # Application entry point
│   ├── style.css         # Tailwind directives & custom styles
│   ├── config/
│   │   └── constants.js  # Configuration constants
│   └── modules/
│       ├── validator.js  # Input validation
│       ├── qrGenerator.js # QR code generation
│       ├── svgBuilder.js # SVG composition
│       └── fileHandler.js # File download/print
├── public/
│   └── icons/            # Logo assets
└── dist/                 # Production build output
```

### Key Dependencies

- **[qrcode](https://www.npmjs.com/package/qrcode)**: Reliable QR code generation with SVG support
- **[vite](https://vitejs.dev/)**: Fast build tool and dev server
- **[tailwindcss](https://tailwindcss.com/)**: Utility-first CSS framework

### Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Legacy Support**: Automatic polyfills via Vite legacy plugin
- **Required Features**: SVG support, ES6 modules, localStorage

## Configuration

Key settings can be modified in `src/config/constants.js`:

```javascript
export const CONFIG = {
  BASE_URL: 'https://peakbook.app/scan',    // QR URL base
  TOKEN_LENGTH: 20,                        // Token character length
  STICKER: {
    SIZE_CM: 5,                           // Sticker size (5cm × 5cm)
    BLEED_CM: 0.3,                        // Bleed margin (3mm)
  },
  QR: {
    SIZE_CM: 4,                           // QR code size (4cm)
    ERROR_CORRECTION: 'H',                // High error correction
  },
  // ... more settings
};
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server with HMR
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Development Features

- **Hot Module Replacement (HMR)**: Instant updates during development
- **Modern ES Modules**: Clean import/export syntax throughout
- **Auto-refresh**: Changes reflected immediately in browser
- **Debug Mode**: Console logging in development (disabled in production)
- **Source Maps**: Available in development for debugging

### Adding Features

The modular architecture makes it easy to extend:

1. **New Validation**: Add rules to `src/modules/validator.js`
2. **QR Options**: Extend `src/modules/qrGenerator.js`
3. **SVG Features**: Modify `src/modules/svgBuilder.js`
4. **Export Formats**: Enhance `src/modules/fileHandler.js`

## Deployment

### Static Hosting

The built files in `dist/` can be deployed to any static hosting service:

- **GitHub Pages**: Enable Pages in repo settings
- **Netlify**: Connect repo for auto-deployment
- **Vercel**: Import project for instant deployment
- **AWS S3 + CloudFront**: Upload `dist/` contents
- **Any Web Server**: Serve `dist/` directory

### Environment Variables

Vite supports `.env` files for different environments:

```bash
# .env.production
VITE_BASE_URL=https://peakbook.app/scan
VITE_DEBUG=false
```

Access in code: `import.meta.env.VITE_BASE_URL`

## Testing

### Manual Testing Checklist

**Token Validation:**
- [x] Accepts valid 20-char alphanumeric tokens
- [x] Rejects invalid characters and lengths
- [x] Real-time validation feedback

**QR Generation:**
- [x] Generates scannable QR codes
- [x] Proper error correction with logo overlay
- [x] Handles various token combinations

**SVG Output:**
- [x] Correct dimensions (5cm × 5cm + bleed)
- [x] Logo centered and properly scaled
- [x] Caption positioned and readable
- [x] Valid SVG structure

**File Operations:**
- [x] SVG download with proper filename
- [x] Print preview opens correctly
- [x] Cross-browser compatibility

## Troubleshooting

### Common Issues

**🔧 QR Code Won't Scan**
- Ensure high print quality (300 DPI+)
- Check for printing artifacts or low contrast
- Test with different QR scanner apps
- Verify token format (exactly 20 characters, A-Z0-9)

**📱 Download Issues**
- Modern browsers support File System Access API
- Falls back to traditional anchor download
- Check browser popup/download permissions

**🖨 Print Problems**
- Use "Print at 100% scale" (no fit-to-page)
- Ensure SVG format is supported by printer
- Test with office printer before professional printing

**⚡ Build Errors**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify all dependencies are installed

### Performance

**Production Bundle Sizes:**
- Main JS bundle: ~65KB (gzipped: ~21KB)
- CSS bundle: ~18KB (gzipped: ~4KB)
- Legacy support: ~42KB (gzipped: ~17KB)
- Total first load: ~125KB (gzipped: ~42KB)

## Contributing

This is a focused single-purpose tool. For enhancements:

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes following existing patterns
4. Test thoroughly with various tokens
5. Submit pull request with description

## License

MIT License - see LICENSE file for details.

## Future Enhancements

Potential future features (currently out of scope):

- **Batch Mode**: CSV import for multiple stickers
- **Custom Themes**: Color schemes and branding options
- **Grid Layout**: Multiple stickers per sheet
- **PNG Export**: Raster format fallback
- **API Integration**: Direct token generation
- **Mobile App**: Native mobile version

---

**Generated with ❤️ for Peakbook**