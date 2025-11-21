# Flipbook Setup Guide

## Issue Resolved

The flipbook was not working because the PDF.js library dependency was missing from the `/public/flipbook/js/libs/` directory.

## Solution Applied

1. **Downloaded PDF.js Libraries**:
   - `pdf.min.js` (216 KB) - Core PDF.js library
   - `pdf.worker.min.js` (985 KB) - PDF.js web worker

2. **Updated Configuration**:
   - Added PDF.js script tag to `app/layout.tsx`
   - Updated `lib/flipbook-loader.ts` to configure PDF.js worker path
   - Added `pdfjsLib` to Window interface in `lib/types.ts`

## File Structure

```
public/
└── flipbook/
    ├── css/
    │   └── flipbook.min.css
    └── js/
        ├── flipbook.min.js             (Main plugin)
        ├── flipbook.pdfservice.min.js  (PDF service)
        ├── flipbook.book3.min.js       (3D book renderer)
        ├── flipbook.scroll.min.js      (Scroll mode)
        ├── flipbook.swipe.min.js       (Swipe interactions)
        ├── flipbook.webgl.min.js       (WebGL renderer)
        └── libs/
            ├── iscroll.min.js          (Touch scrolling)
            ├── mark.min.js             (Text highlighting)
            ├── mod3d.min.js            (3D effects)
            ├── pdf.min.js              (PDF.js library)
            ├── pdf.worker.min.js       (PDF.js worker)
            └── three.min.js            (Three.js 3D library)
```

## How It Works

1. **Loading Order** (in `app/layout.tsx`):
   ```html
   <head>
     <!-- 1. jQuery -->
     <script src="jquery-3.6.0.min.js"></script>

     <!-- 2. PDF.js -->
     <script src="/flipbook/js/libs/pdf.min.js"></script>

     <!-- 3. Flipbook PDF Service -->
     <script src="/flipbook/js/flipbook.pdfservice.min.js"></script>

     <!-- 4. Flipbook Plugin -->
     <script src="/flipbook/js/flipbook.min.js"></script>
   </head>
   ```

2. **Initialization** (in `lib/flipbook-loader.ts`):
   ```typescript
   // Configure PDF.js worker
   if (window.pdfjsLib) {
     window.pdfjsLib.GlobalWorkerOptions.workerSrc =
       '/flipbook/js/libs/pdf.worker.min.js'
   }

   // Initialize flipbook with PDF.js
   container.flipBook({
     pdfUrl: '/pdf/manifesto.pdf',
     pdfjsLib: window.pdfjsLib,
     pdfJsWorkerSrc: '/flipbook/js/libs/pdf.worker.min.js',
     // ... other options
   })
   ```

3. **Client Component** (`app/components/Flipbook.tsx`):
   - Uses `'use client'` directive for React hooks
   - Initializes after 1-second delay to ensure scripts loaded
   - Provides loading state and error handling
   - Includes fallback download option

## Testing the Flipbook

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Scroll down to the "Manifesto 2025" section

4. The flipbook should display with:
   - Page flip animations
   - Zoom controls
   - Search functionality
   - Download button
   - Print option
   - Table of contents

## Troubleshooting

### Flipbook Not Loading

**Check Console for Errors:**
```bash
# Open browser DevTools (F12)
# Check Console tab for errors
```

**Common Issues:**

1. **404 on pdf.min.js**:
   - Verify files exist: `ls public/flipbook/js/libs/`
   - Should show: `pdf.min.js` and `pdf.worker.min.js`

2. **"jQuery not loaded" error**:
   - jQuery script may not have loaded in time
   - Increase delay in Flipbook component (line 31)

3. **"Container not found" error**:
   - DOM element with id `flipbook-container` not rendered
   - Check component mounting

4. **PDF not displaying**:
   - Verify PDF exists: `ls public/pdf/manifesto.pdf`
   - Check PDF file is not corrupted
   - Try with a smaller test PDF first

### Performance Issues

If the flipbook is slow:

1. **Reduce PDF Size**:
   - Compress the PDF (< 20 MB recommended)
   - Reduce image quality within PDF

2. **Adjust Settings** (in `lib/flipbook-loader.ts`):
   ```typescript
   {
     singlePageMode: true,  // Show one page at a time
     viewMode: '2d',        // Use 2D instead of 3D
   }
   ```

3. **Increase Loading Delay** (in `app/components/Flipbook.tsx`):
   ```typescript
   setTimeout(() => {
     // Initialize flipbook
   }, 2000) // Increase from 1000 to 2000ms
   ```

## PDF.js Version

Current version: **2.10.377**

To update to a newer version:

1. Download from [cdnjs.com/libraries/pdf.js](https://cdnjs.com/libraries/pdf.js)

2. Replace files:
   ```bash
   cd public/flipbook/js/libs/
   curl -o pdf.min.js https://cdnjs.cloudflare.com/ajax/libs/pdf.js/NEW_VERSION/pdf.min.js
   curl -o pdf.worker.min.js https://cdnjs.cloudflare.com/ajax/libs/pdf.js/NEW_VERSION/pdf.worker.min.js
   ```

3. Update script src in `app/layout.tsx` if needed

## Additional Features

The flipbook supports:

- **Page Navigation**: Arrow keys, click, drag
- **Zoom**: Mouse wheel, pinch gesture, buttons
- **Search**: Full-text search within PDF
- **Download**: Original PDF download
- **Print**: Browser print functionality
- **Share**: Social media sharing
- **Responsive**: Mobile-optimized interface
- **3D Mode**: Realistic page flip effect

## Resources

- **PDF.js Documentation**: https://mozilla.github.io/pdf.js/
- **Real3D Flipbook**: https://codecanyon.net/item/real3d-flipbook-jquery-plugin/6942587
- **Next.js Script Component**: https://nextjs.org/docs/pages/api-reference/components/script

---

**Last Updated**: November 2025
**Status**: ✅ Working
