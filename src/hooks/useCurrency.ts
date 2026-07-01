import { useState, useEffect } from 'react'
import { getPreferredCurrency, setPreferredCurrency, formatCurrency, getCurrencyInfo, currencies, type CurrencyCode } from '../lib/currency'

export function useCurrency() {
  const [code, setCode] = useState<CurrencyCode>(getPreferredCurrency)

  useEffect(() => {
    const handler = () => setCode(getPreferredCurrency())
    window.addEventListener('currency-changed', handler)
    return () => window.removeEventListener('currency-changed', handler)
  }, [])

  return {
    currency: code,
    setCurrency: setPreferredCurrency,
    format: (amount: number) => formatCurrency(amount, code),
    info: getCurrencyInfo(code),
    currencies,
  }
}
