declare global {
  interface JQueryCollection {
    length?: number
    flipBook?: (cfg: unknown) => void
  }

  interface Window {
    jQuery?: ((selector?: unknown) => JQueryCollection) & {
      fn?: { flipBook?: unknown }
    }
    pdfjsLib?: { GlobalWorkerOptions?: { workerSrc?: string } }
  }
}

export interface FlipbookOptions {
  pdfPath: string
  backgroundColor?: string
  height?: number
}

export function initializeFlipbook(
  containerId: string,
  options: FlipbookOptions
): any {
  if (typeof window === 'undefined') {
    console.warn('Flipbook can only be initialized in browser')
    return null
  }

  if (!window.jQuery || !window.jQuery.fn || typeof window.jQuery.fn.flipBook !== 'function') {
    console.error('jQuery or flipBook plugin not loaded')
    return null
  }

  try {
    const $ = window.jQuery
    const container = $(`#${containerId}`)

    if (container.length === 0) {
      console.error(`Container #${containerId} not found`)
      return null
    }

    // Configure PDF.js worker path if available
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/flipbook/js/libs/pdf.worker.min.js'
    }

    // Initialize flipbook with forced embedded mode
    if (typeof container.flipBook !== 'function') {
      console.error('flipBook method not available on container')
      return null
    }

    const flipbook = container.flipBook({
      pdfUrl: options.pdfPath,
      pdfjsLib: window.pdfjsLib,
      pdfJsWorkerSrc: '/flipbook/js/libs/pdf.worker.min.js',
      btnZoomIn: { enabled: true },
      btnZoomOut: { enabled: true },
      btnToc: { enabled: true },
      btnShare: { enabled: true },
      btnDownloadPages: { enabled: true },
      btnDownloadPdf: { enabled: true },
      btnPrint: { enabled: true },
      btnSearch: { enabled: true },
      btnAutoplay: { enabled: false },
      btnExpand: { enabled: false },
      btnSinglePage: { enabled: true },
      backgroundColor: options.backgroundColor || '#2C3E50',
      height: options.height || 600,
      responsiveView: true,
      responsiveViewTreshold: 768,
      singlePageMode: false,
      viewMode: '3d',
      lightBox: false,
      lightboxFullscreen: false,
      lightboxBackground: 'none',
      lightboxBackgroundColor: 'transparent',
      lightboxStartOpen: false,
      lightboxCloseOnBack: false,
      deeplinking: { enabled: false },
      autoHeight: false,
      centerSinglePage: true,
    })

    // Force remove any overlay elements that might be created
    setTimeout(() => {
      const overlays = document.querySelectorAll('.flipbook-overlay, .flipbook-browser-fullscreen')
      overlays.forEach(overlay => {
        if (overlay instanceof HTMLElement) {
          overlay.style.display = 'none'
          overlay.remove()
        }
      })
    }, 100)

    return flipbook
  } catch (error) {
    console.error('Error initializing flipbook:', error)
    return null
  }
}

export function destroyFlipbook(flipbookInstance: any): void {
  if (flipbookInstance && typeof flipbookInstance.dispose === 'function') {
    try {
      flipbookInstance.dispose()
    } catch (error) {
      console.error('Error destroying flipbook:', error)
    }
  }
}
