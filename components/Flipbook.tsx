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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerHeight, setContainerHeight] = useState('100vh')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Full viewport height
    const updateHeight = () => setContainerHeight('100vh')
    updateHeight()
    window.addEventListener('resize', updateHeight)

    if (typeof window === 'undefined') return

    // Use absolute worker URL so the worker is fetched from the same origin in production
    const workerUrl = `${window.location.origin}/flipbook/js/libs/pdf.worker.min.js`

    // If pdfjsLib loaded, set the worker path right away
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
        console.log('pdfjs worker set to', workerUrl)
      } catch (e) {
        console.warn('Unable to set pdfjs workerSrc:', e)
      }
    }

    // Poll for jQuery and flipBook plugin readiness
    let tries = 0
    const maxTries = 30
    const delay = 250
    let timer = 0

    const initFlipbook = () => {
      tries++
      const $ = window.jQuery as any
      const containerEl = containerRef.current

      // Check jQuery and plugin
      if (!window.jQuery || !window.jQuery.fn || typeof window.jQuery.fn.flipBook !== 'function') {
        if (tries >= maxTries) {
          setError('Flipbook assets failed to load: jQuery or flipBook plugin missing. Check Network for 404s.')
          console.error('Flipbook init failed: jQuery or plugin not available after retries')
          return
        }
        timer = window.setTimeout(initFlipbook, delay)
        return
      }

      if (!containerEl) {
        setError('Flipbook container not found in DOM')
        console.error('Flipbook init failed: container element missing')
        return
      }

      // Ensure pdfjsLib worker path is set just before init (in case pdf.min.js loaded later)
      if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
      }

      try {
        // Initialize flipbook using jQuery instance
        $(containerEl).flipBook({
          pdfUrl: pdfPath,
          pdfjsLib: window.pdfjsLib,
          pdfJsWorkerSrc: workerUrl,

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

          // Page flipping
          flipDuration: 1000,
          flipSound: false,

          // Mobile & responsive
          mobileScrollSupport: true,
          responsiveView: true,
          autoHeight: false,
          height: window.innerHeight,

          // Styling
          backgroundColor: '#2C3E50',
          backgroundTransparent: false,

          // Buttons
          btnNext: { enabled: true, title: 'Next page' },
          btnPrev: { enabled: true, title: 'Previous page' },
          btnZoomIn: { enabled: true, title: 'Zoom in' },
          btnZoomOut: { enabled: true, title: 'Zoom out' },
          btnDownloadPdf: { enabled: true, title: 'Download PDF', url: pdfPath },
          btnPrint: { enabled: true, title: 'Print' },
          btnThumbs: { enabled: true, title: 'Pages' },
          btnToc: { enabled: true, title: 'Table of Contents' },
          btnSearch: { enabled: true, title: 'Search' },

          // Force container mode
          lightBox: false,
          lightboxFullscreen: false,
          lightboxStartOpen: false,
          lightboxCloseOnBack: false,
          deeplinking: { enabled: false },
        })

        console.log('Flipbook initialized successfully in container mode')
      } catch (initErr) {
        setError(`Flipbook initialization error: ${(initErr as Error).message}`)
        console.error('Flipbook initialization exception:', initErr)
      }
    }

    // Start initialization attempts
    initFlipbook()

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('resize', updateHeight)
    }
  }, [pdfPath])

  return (
    <div className="w-full flex flex-col">
      <style jsx global>{`
        .flipbook-overlay { display: none !important; }
        body.flipbook-overflow-hidden { overflow: auto !important; position: static !important; }
        @media (max-width: 768px) {
          .flipbook-left-arrow, .flipbook-right-arrow {
            height: 24px !important; font-size: 24px !important; width: 24px !important;
            margin-top: -12px !important; padding: 6px !important;
          }
        }
      `}</style>

      {error ? (
        <div style={{ color: 'red', padding: '1rem' }}>
          <strong>{error}</strong>
          <div style={{ marginTop: '0.5rem' }}>
            Fallback: <a href={pdfPath} target="_blank" rel="noreferrer">Download PDF</a>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          id="flipbook-container"
          className="w-full bg-[#2C3E50] overflow-hidden"
          style={{ height: containerHeight, position: 'relative' }}
        />
      )}

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