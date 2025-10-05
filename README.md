# Peakbook Admin

**Peakbook Admin** is a comprehensive administrative platform for managing Peakbook content, operations, and moderation. This platform provides tools for peak management, QR code generation, translation management, and content approval workflows.

## 🎯 Features

### Core Functionality

- **📍 Peak Management**: Create, edit, and manage mountain peak entries with detailed information
- **🔲 QR Code Generation**: Generate print-ready QR stickers for Peakbook check-in points
- **🌐 Translation Management**: Manage multilingual content for peaks and other entities
- **✅ Approval Engine**: Moderator mode for reviewing and approving Peakbook entries
- **👥 User Management**: Admin tools for managing users and permissions

### QR Code Features

- Generate QR codes for `https://peakbook.app/scan?token=...` URLs
- Professional print-ready SVG output (5cm × 5cm with 3mm bleed margins)
- Logo overlay with high error correction (Q level for 25% recovery)
- Customizable caption text below QR code
- Real-time token validation (20 characters, A-Z0-9)
- One-click SVG download with proper naming
- Print preview with professional layout

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Supabase account (for future features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd peakbook-admin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**

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

The built files will be in the `dist/` directory, ready for deployment.

## 🏗️ Project Structure

### Current Structure (Vite/Vanilla JS)

```
peakbook-admin/
├── src/
│   ├── main.js              # Application entry point
│   ├── style.css            # TailwindCSS directives & custom styles
│   ├── config/
│   │   └── constants.js     # Configuration constants
│   └── modules/
│       ├── validator.js     # Input validation & sanitization
│       ├── qrGenerator.js   # QR code generation logic
│       ├── svgBuilder.js    # SVG composition & layout
│       └── fileHandler.js   # File download/print operations
├── public/
│   └── icons/               # Logo assets & static files
├── index.html               # Main HTML entry
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS setup
└── package.json             # Dependencies & scripts
```

### Future Structure (Next.js/TypeScript)

```
peakbook-admin/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── peaks/          # Peak management
│   │   ├── qr-codes/       # QR generation
│   │   ├── translations/   # Translation management
│   │   └── moderation/     # Approval engine
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── forms/              # Form components
│   └── features/           # Feature-specific components
├── lib/                    # Utilities & helpers
│   ├── supabase/           # Supabase client & utilities
│   ├── utils/              # Utility functions
│   └── validations/        # Zod schemas
└── types/                  # TypeScript definitions
```

## 📋 Development

### Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Make your changes** with auto-reload enabled
3. **Format your code**: Auto-format on save (VS Code) or `npm run format`
4. **Run linter**: `npm run lint` to catch issues
5. **Test your changes** in the browser
6. **Commit your work** with descriptive messages

### Code Formatting

This project uses **Prettier** for consistent code formatting:

- **Auto-format on save** is enabled in VS Code (see `.vscode/settings.json`)
- **Format all files**: `npm run format`
- **Check formatting**: `npm run format:check`
- **Format specific files**: `npx prettier --write "path/to/file.js"`

### Linting

ESLint is configured to catch common issues:

```bash
npm run lint           # Check for issues
npm run lint -- --fix  # Auto-fix issues
```

## 🎨 Technology Stack

- **Build Tool**: Vite 5+ (fast dev server & optimized builds)
- **Styling**: TailwindCSS 3+ (utility-first CSS framework)
- **QR Generation**: `qrcode` package (reliable QR code generation)
- **Future Stack**: Next.js 14+, React 18+, TypeScript, Supabase

## 🔧 Configuration

### QR Code Settings

Key settings in `src/config/constants.js`:

```javascript
export const CONFIG = {
  BASE_URL: 'https://peakbook.app/scan', // QR URL base
  TOKEN_LENGTH: 20, // Token character length
  STICKER: {
    SIZE_CM: 5, // Sticker size (5cm × 5cm)
    BLEED_CM: 0.3, // Bleed margin (3mm)
  },
  QR: {
    SIZE_CM: 4, // QR code size (4cm)
    ERROR_CORRECTION: 'Q', // Q level (25% recovery)
  },
  // ... more settings
};
```

### Environment Variables

Create a `.env.local` file:

```bash
# Future Supabase integration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PEAKBOOK_URL=https://peakbook.app
```

## 📦 Features Roadmap

### Phase 1: QR Code Generator ✅

- [x] Single token QR generation
- [x] SVG output with print specifications
- [x] Logo overlay with error correction
- [x] Real-time validation
- [x] Download & print functionality

### Phase 2: Migration to Next.js (In Progress)

- [ ] Set up Next.js project with App Router
- [ ] Migrate to TypeScript
- [ ] Configure Supabase integration
- [ ] Implement authentication
- [ ] Set up database schema

### Phase 3: Peak Management

- [ ] Peak CRUD operations
- [ ] Image upload & management
- [ ] Location mapping (lat/lng)
- [ ] Category & difficulty classification
- [ ] Search & filtering

### Phase 4: Translation System

- [ ] Multi-language support
- [ ] Translation interface
- [ ] Language fallback logic
- [ ] Translation status tracking

### Phase 5: Approval Engine

- [ ] Moderation queue
- [ ] Approval workflow
- [ ] Audit trail
- [ ] Notification system
- [ ] Batch operations

## 🖨️ QR Code Usage

### Generating a QR Sticker

1. **Enter Token**: Input a 20-character token (A-Z and 0-9 only)
2. **Customize Caption**: Edit the caption text (defaults to "Scan to check-in")
3. **Configure Colors**: Adjust background, dots, and corner colors
4. **Generate**: Click "Generate Sticker" to create the preview
5. **Download**: Click "Download SVG" to save the print-ready file
6. **Print Test**: Use "Print Preview" to test before bulk printing

### Printing Guidelines

**For Professional Printing:**

- File format: SVG (vector, scalable)
- Sticker size: 5cm × 5cm
- Bleed margins: 3mm (included in SVG)
- Print quality: 300 DPI minimum
- Material: High-quality vinyl with matte or gloss finish

**Quality Control:**

- Test scan printed QR codes before bulk production
- Ensure QR modules are crisp and well-defined
- Verify logo is centered and clearly visible
- Check caption text readability
- Confirm proper trimming to 5cm × 5cm

## 🧪 Testing

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

### Future Testing

When migrating to Next.js:

- Unit tests with Jest/Vitest
- Integration tests for API routes
- E2E tests with Playwright
- Component testing with React Testing Library

## 🚀 Deployment

### Static Hosting (Current)

The built files in `dist/` can be deployed to:

- **GitHub Pages**: Enable Pages in repo settings
- **Netlify**: Connect repo for auto-deployment
- **Vercel**: Import project for instant deployment
- **AWS S3 + CloudFront**: Upload `dist/` contents

### Future Deployment (Next.js)

Recommended platform: **Vercel** (optimized for Next.js)

```bash
# Deploy to Vercel
npx vercel

# Production deployment
npx vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the code style
4. Run formatter: `npm run format`
5. Run linter: `npm run lint -- --fix`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)

---

**Built with ❤️ for Peakbook**
