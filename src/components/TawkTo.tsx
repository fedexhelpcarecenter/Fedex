import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    Tawk_API?: any
    Tawk_LoadStart?: Date
  }
}

export function TawkTo() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    window.Tawk_API.customStyle = {
      bubble: {
        background: '#4D148C',
        color: '#FFFFFF',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      },
      header: {
        background: '#4D148C',
        color: '#FFFFFF',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      },
      chat: {
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      },
    }

    window.Tawk_API.onLoad = function () {
      try {
        window.Tawk_API?.setAttributes?.(
          {
            name: 'FedEx Global Platform User',
            email: 'support@fedexglobalplatform.com',
          },
          function () {}
        )
        window.Tawk_API?.maximizeWidget?.()
        window.Tawk_API?.minimizeWidget?.()
      } catch {}
    }
    window.Tawk_API.onOffline = function () {
      window.Tawk_API?.setAttributes?.(
        {
          name: 'FedEx Global Platform User',
          email: 'support@fedexglobalplatform.com',
        },
        function () {}
      )
    }

    const s1 = document.createElement('script')
    s1.async = true
    s1.src = 'https://embed.tawk.to/6a464e249310bd1d4ef8c3cf/1jsha2g3a'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')
    document.head.appendChild(s1)

    const style = document.createElement('style')
    style.textContent = `
      /* FedEx-branded Tawk.to widget */
      .tawk-min-container .tawk-button {
        background: #4D148C !important;
        box-shadow: 0 4px 12px rgba(77,20,140,0.3) !important;
        border-radius: 50% !important;
      }
      .tawk-min-container .tawk-button:hover {
        background: #6B2FB0 !important;
        box-shadow: 0 6px 16px rgba(77,20,140,0.4) !important;
      }
      .tawk-header {
        background: linear-gradient(135deg, #4D148C 0%, #6B2FB0 100%) !important;
      }
      .tawk-header .tawk-title {
        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
      }
      .tawk-header .tawk-subtitle {
        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
      }
      .tawk-visitor-message {
        background: #F3EEF9 !important;
        color: #1a1a2e !important;
      }
      .tawk-agent-message {
        background: #4D148C !important;
        color: #ffffff !important;
      }
      .tawk-send-button {
        background: #4D148C !important;
      }
      .tawk-send-button:hover {
        background: #6B2FB0 !important;
      }
      .tawk-agent-name {
        color: #4D148C !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      const widget = document.getElementById('tawkto-widget')
      if (widget) widget.remove()
      const script = document.querySelector('script[src*="tawk.to"]')
      if (script) script.remove()
      style.remove()
    }
  }, [])

  return null
}
