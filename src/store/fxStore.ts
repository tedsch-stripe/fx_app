import { defineStore } from 'pinia'

const hardcodedRates = {
  AUD: 1.5383,
  CAD: 1.3655,
  CHF: 0.81708,
  EUR: 0.86896,
  GBP: 0.74314,
  JPY: 144.83,
  USD: 1.0, // Base currency
}

export const chargeTypes = [
  { id: 'direct', name: 'Direct Charge' },
  { id: 'destination', name: 'Destination Charge' },
  { id: 'sct', name: 'Separate Charge and Transfer' },
]

const currencyMap: Record<string, string> = {
  US: 'USD',
  FR: 'EUR',
  DE: 'EUR',
  GB: 'GBP',
  JP: 'JPY',
  CA: 'CAD',
  AU: 'AUD',
}

type FxState = {
  chargeType: string
  platformCountry: string
  connectedCountry: string
  presentmentCurrency: string
  platformSettlementCurrency: string
  connectedSettlementCurrency: string
  rates: Record<string, number>
  feePayer: string
}

export const useFxStore = defineStore('fx', {
  state: (): FxState => ({
    chargeType: 'direct',
    platformCountry: 'GB',
    connectedCountry: 'IE', // Ireland for EUR settlement
    presentmentCurrency: 'CHF',
    platformSettlementCurrency: 'GBP',
    connectedSettlementCurrency: 'EUR',
    rates: hardcodedRates,
    feePayer: 'connected',
  }),

  getters: {
    // A simple getter to summarize the current selection
    selectionSummary(state) {
      return `Platform: ${state.platformCountry} (${state.platformSettlementCurrency}) | Connected: ${state.connectedCountry} (${state.connectedSettlementCurrency}) | Charge: ${state.presentmentCurrency}`
    },
    // A getter to safely calculate the exchange rate between any two currencies
    getRate:
      (state) =>
      (from: string, to: string): number => {
        if (!state.rates || from === to) {
          return 1
        }
        // Assuming USD is the base for the fetched rates
        const fromRate = state.rates[from] || 1 // Rate of 'from' currency to USD
        const toRate = state.rates[to] || 1 // Rate of 'to' currency to USD

        // To convert from A to B: (amount in A) * (USD per A) * (B per USD)
        // which simplifies to: (amount in A) * (rate of B / rate of A)
        return toRate / fromRate
      },
  },

  actions: {
    setPlatformCountry(country: string) {
      this.platformCountry = country
      if (currencyMap[country]) {
        this.platformSettlementCurrency = currencyMap[country]
      }
    },
    setConnectedCountry(country: string) {
      this.connectedCountry = country
      if (currencyMap[country]) {
        this.connectedSettlementCurrency = currencyMap[country]
      }
    },
    setPresentmentCurrency(currency: string) {
      this.presentmentCurrency = currency
    },
    setFeePayer(payer: string) {
      this.feePayer = payer
    },
  },
})

// Mock data for selectors
export const availableCountries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
]

export const availableCurrencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
]

export const feePayerOptions = [
  { id: 'connected', name: 'Connected Account Pays' },
  { id: 'platform', name: 'Platform Pays' },
]
