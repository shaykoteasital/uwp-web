'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface JQueryCollection {
    length?: number
    flipBook?: (cfg: unknown) => void
    remove?: () => void
    removeClass?: (cls?: string) => void
  }

  interface Window {
    jQuery?: ((selector?: unknown) => JQueryCollection) & {
      fn?: { flipBook?: unknown }
    }
    pdfjsLib?: { GlobalWorkerOptions?: { workerSrc?: string } }
  }
}

interface FlipbookProps {
  pdfPath?: string
  pdfSize?: string
}

export default function Flipbook({
  pdfPath = '/pdf/manifesto.pdf',
  pdfSize = '43 MB',
}: FlipbookProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState('100vh')

  useEffect(() => {
    // Set container height to full viewport height
    const updateHeight = () => {
      setContainerHeight('100vh')
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    // Wait for DOM and scripts to be ready
    const timer = setTimeout(() => {
      if (!containerRef.current || typeof window === 'undefined') {
        return
      }

      // Check if jQuery and flipbook plugin are loaded
      const jq = window.jQuery
      if (!jq || !jq.fn || !jq.fn.flipBook) {
        console.error('jQuery or flipBook plugin not loaded')
        return
      }

      const $ = jq
      const container = $('#flipbook-container')

      if (container.length === 0) {
        console.error('Container not found')
        return
      }

      // Configure PDF.js worker path
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions!.workerSrc = '/flipbook/js/libs/pdf.worker.min.js'
      }

      // Initialize flipbook with configuration from original HTML example
        try {
          if (typeof container.flipBook === 'function') {
            container.flipBook({
          // PDF source
          pdfUrl: pdfPath,
          pdfjsLib: window.pdfjsLib,
          pdfJsWorkerSrc: '/flipbook/js/libs/pdf.worker.min.js',

          // Layout and display
          pageMode: 'double',
          singlePageMode: false,

          // Performance optimization
          textureSize: 2048,
          thumbnailTextureSize: 256,
          preloadPages: 3,

          // UI Controls
          controlsPosition: 'bottom',
          menuSelector: true,
          menuTransparent: false,
          menuOverBook: true,

          // Features
          downloadURL: pdfPath,
          downloadEnabled: true,
          printEnabled: true,
          searchEnabled: true,

          // Table of Contents
          tableOfContents: true,
          tableOfContentsSidebar: true,

          // Zoom
          zoomMax: 4,
          zoomMin: 0.95,
          zoomStep: 0.1,

          // Page flipping - THIS IS THE KEY FOR ANIMATIONS!
          flipDuration: 1000,
          flipSound: false,
          sound: false,
          sounds: {
            startFlip: '',
            endFlip: ''
          },

          // Mobile optimization
          mobileScrollSupport: true,

          // Responsive behavior
          responsiveView: true,
          autoHeight: false,
          height: window.innerHeight,

          // Colors to match UWP branding
          backgroundColor: '#2C3E50',
          backgroundTransparent: false,

          // Navigation buttons
          btnNext: { enabled: true, title: 'Next page' },
          btnPrev: { enabled: true, title: 'Previous page' },
          btnZoomIn: { enabled: true, title: 'Zoom in' },
          btnZoomOut: { enabled: true, title: 'Zoom out' },
          btnAutoplay: { enabled: false },
          btnExpand: { enabled: false },
          btnShare: { enabled: false },
          btnDownloadPages: { enabled: false },
          btnDownloadPdf: { enabled: true, title: 'Download PDF', url: pdfPath },
          btnSound: { enabled: false },
          btnPrint: { enabled: true, title: 'Print' },
          btnThumbs: { enabled: true, title: 'Pages' },
          btnToc: { enabled: true, title: 'Table of Contents' },
          btnBookmark: { enabled: false },
          btnNotes: { enabled: false },
          btnSelect: { enabled: true },
          btnSearch: { enabled: true, title: 'Search' },

          // Force container mode - NO lightbox
          lightBox: false,
          lightboxFullscreen: false,
          lightboxStartOpen: false,
          lightboxCloseOnBack: false,
          deeplinking: { enabled: false },
        })

            console.log('Flipbook initialized successfully in container mode')
          } else {
            console.error('flipBook method not available on container')
          }

          // Remove any overlay elements that may have been created
          setTimeout(() => {
            const overlay = $('.flipbook-overlay')
            if (overlay && typeof overlay.remove === 'function') overlay.remove()
            const fullscreen = $('.flipbook-browser-fullscreen')
            if (fullscreen && typeof fullscreen.removeClass === 'function') fullscreen.removeClass('flipbook-browser-fullscreen')
          }, 200)
      } catch (err) {
        console.error('Flipbook initialization error:', err)
      }
    }, 2000)

    // Cleanup
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateHeight)
    }
  }, [pdfPath])

  return (
    <div className="w-full flex flex-col">
      {/* Hide any overlay elements globally and style arrows */}
      <style jsx global>{`
        .flipbook-overlay {
          display: none !important;
        }
        body.flipbook-overflow-hidden {
          overflow: auto !important;
          position: static !important;
        }

        /* Make flipbook arrows smaller on mobile */
        @media (max-width: 768px) {
          .flipbook-left-arrow,
          .flipbook-right-arrow {
            height: 24px !important;
            font-size: 24px !important;
            width: 24px !important;
            margin-top: -12px !important;
            padding: 6px !important;
          }
        }
      `}</style>

      {/* Flipbook Container - Full Screen */}
      <div
        ref={containerRef}
        id="flipbook-container"
        className="w-full bg-[#2C3E50] overflow-hidden"
        style={{
          height: containerHeight,
          position: 'relative',
        }}
      />

      {/* Instructions and Download - Below flipbook */}
      <div className="w-full bg-[#F5F5F5] py-6 px-4 text-center">
        <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-4">
          Use the arrows to turn pages. For mobile users, you can also download the PDF.
        </p>
        <a
          href={pdfPath}
          download
          className="inline-block bg-uwp-red text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-sm sm:text-base hover:bg-[#c01820] transition-colors shadow-md"
        >
          Download PDF ({pdfSize})
        </a>
      </div>
    </div>
  )
}
