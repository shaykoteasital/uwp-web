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
  const [error, setError] = useState<string | null>(null)
  const initTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Helper that returns the absolute path to the worker so deployment origin is included
    const workerUrl = `${window.location.origin}/flipbook/js/libs/pdf.worker.min.js`

    // Set PDF.js worker src if pdfjsLib is present
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
    }

    // Wait for jQuery and flipBook plugin to be ready
    let tries = 0
    const maxTries = 20
    const interval = 300 // ms

    const checkAndInit = () => {
      tries++
      const $ = window.jQuery as any
      const container = containerRef.current as any

      if (!$ || !$.fn || typeof $.fn.flipBook !== 'function') {
        if (tries >= maxTries) {
          setError('Flipbook assets failed to load (jQuery or plugin missing). Check network console for 404s.')
          return
        }
        initTimeoutRef.current = window.setTimeout(checkAndInit, interval)
        return
      }

      if (!container) {
        setError('Flipbook container not found.')
        return
      }

      try {
        // Initialize the flipbook plugin
        $(container).flipBook({
          pdfUrl: pdfPath,
          pdfjsLib: window.pdfjsLib,
          pdfJsWorkerSrc: workerUrl,

          pageMode: 'double',
          singlePageMode: false,
          textureSize: 2048,
          thumbnailTextureSize: 256,
          preloadPages: 3,
          downloadURL: pdfPath,
          downloadEnabled: true,
          printEnabled: true,
          searchEnabled: true,
          tableOfContents: true,
          tableOfContentsSidebar: true,
          flipDuration: 1000,
          mobileScrollSupport: true,
          responsiveView: true,
          autoHeight: false,
          height: window.innerHeight,
          backgroundColor: '#2C3E50',
          backgroundTransparent: false,
          btnNext: { enabled: true, title: 'Next page' },
        })
      } catch (e) {
        setError(`Flipbook initialization error: ${(e as Error).message}`)
      }
    }

    checkAndInit()

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
      // if needed: destroy flipbook instance
    }
  }, [pdfPath])

  return (
    <div>
      {error ? (
        <div style={{ color: 'red', padding: '1rem' }}>
          <strong>{error}</strong>
          <div style={{ marginTop: '0.5rem' }}>
            Fallback: <a href={pdfPath} target="_blank" rel="noreferrer">Download PDF</a>
          </div>
        </div>
      ) : (
        <div id="flipbook-container" ref={containerRef} style={{ width: '100%', height: '100vh' }} />
      )}
    </div>
  )
}