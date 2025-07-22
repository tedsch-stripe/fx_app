<script setup lang="ts">
import {
  useFxStore,
  availableCountries,
  availableCurrencies,
  chargeTypes,
  feePayerOptions,
} from '@/store/fxStore'
import { ref } from 'vue'

const store = useFxStore()
const showCopiedMessage = ref(false)

const shareUrl = () => {
  const params = store.encodeToUrl()
  const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`

  // Update the browser URL with pushState to create a new history entry
  window.history.pushState({}, '', shareableUrl)

  navigator.clipboard
    .writeText(shareableUrl)
    .then(() => {
      showCopiedMessage.value = true
      setTimeout(() => {
        showCopiedMessage.value = false
      }, 2000)
    })
    .catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareableUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      showCopiedMessage.value = true
      setTimeout(() => {
        showCopiedMessage.value = false
      }, 2000)
    })
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-semibold text-gray-900">FX Scenario Configuration</h2>
      <div class="relative">
        <button
          @click="shareUrl"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            ></path>
          </svg>
          Share URL
        </button>

        <!-- Success message -->
        <div
          v-if="showCopiedMessage"
          class="absolute top-full right-0 mt-2 px-3 py-2 bg-green-100 border border-green-200 text-green-800 text-sm rounded-lg shadow-lg z-10"
        >
          URL copied to clipboard!
        </div>
      </div>
    </div>

    <!-- URL Information -->
    <div class="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex">
        <svg
          class="w-5 h-5 text-blue-600 mr-2 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <p class="text-sm text-blue-800 font-medium">Share Configuration</p>
          <p class="text-xs text-blue-700 mt-1">
            Click "Share URL" to update the browser URL and copy it to your clipboard for sharing
            this exact configuration.
          </p>
        </div>
      </div>
    </div>

    <!-- Charge Configuration Section -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <div class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
        Charge Configuration
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Charge Type -->
        <div>
          <label for="charge-type" class="block text-sm font-medium text-gray-700 mb-1"
            >Charge Type</label
          >
          <select
            id="charge-type"
            :value="store.chargeType"
            @change="store.chargeType = ($event.target as HTMLSelectElement).value"
            class="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-colors"
          >
            <option v-for="type in chargeTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>

        <!-- Fee Payer (only for Direct Charges) -->
        <div v-if="store.chargeType === 'direct'" class="transition-all duration-200">
          <label for="fee-payer" class="block text-sm font-medium text-gray-700 mb-1"
            >Fee Payer</label
          >
          <select
            id="fee-payer"
            :value="store.feePayer"
            @change="store.setFeePayer(($event.target as HTMLSelectElement).value)"
            class="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-colors"
          >
            <option v-for="option in feePayerOptions" :key="option.id" :value="option.id">
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Geography Section -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Geography
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Platform Country -->
        <div>
          <label for="platform-country" class="block text-sm font-medium text-gray-700 mb-1">
            Platform Country
          </label>
          <select
            id="platform-country"
            :value="store.platformCountry"
            @change="store.setPlatformCountry(($event.target as HTMLSelectElement).value)"
            class="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg transition-colors"
          >
            <option v-for="country in availableCountries" :key="country.code" :value="country.code">
              {{ country.name }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            Settlement: {{ store.platformSettlementCurrency }}
          </p>
        </div>

        <!-- Connected Account Country -->
        <div>
          <label for="connected-country" class="block text-sm font-medium text-gray-700 mb-1">
            Connected Account Country
          </label>
          <select
            id="connected-country"
            :value="store.connectedCountry"
            @change="store.setConnectedCountry(($event.target as HTMLSelectElement).value)"
            class="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg transition-colors"
          >
            <option v-for="country in availableCountries" :key="country.code" :value="country.code">
              {{ country.name }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            Settlement: {{ store.connectedSettlementCurrency }}
          </p>
        </div>
      </div>
    </div>

    <!-- Currencies Section -->
    <div>
      <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
        <div class="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
        Currencies
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Presentment Currency -->
        <div>
          <label for="presentment-currency" class="block text-sm font-medium text-gray-700 mb-1">
            Presentment Currency
          </label>
          <select
            id="presentment-currency"
            :value="store.presentmentCurrency"
            @change="store.presentmentCurrency = ($event.target as HTMLSelectElement).value"
            class="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-lg transition-colors"
          >
            <option
              v-for="currency in availableCurrencies"
              :key="currency.code"
              :value="currency.code"
            >
              {{ currency.code }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Customer pays in</p>
        </div>

        <!-- Platform Settlement Currency -->
        <div>
          <label
            for="platform-settlement-currency"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Platform Settlement
          </label>
          <select
            id="platform-settlement-currency"
            :value="store.platformSettlementCurrency"
            @change="store.platformSettlementCurrency = ($event.target as HTMLSelectElement).value"
            class="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-lg transition-colors"
          >
            <option
              v-for="currency in availableCurrencies"
              :key="currency.code"
              :value="currency.code"
            >
              {{ currency.code }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Platform receives in</p>
        </div>

        <!-- Connected Settlement Currency -->
        <div>
          <label
            for="connected-settlement-currency"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Connected Settlement
          </label>
          <select
            id="connected-settlement-currency"
            :value="store.connectedSettlementCurrency"
            @change="store.connectedSettlementCurrency = ($event.target as HTMLSelectElement).value"
            class="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 rounded-lg transition-colors"
          >
            <option
              v-for="currency in availableCurrencies"
              :key="currency.code"
              :value="currency.code"
            >
              {{ currency.code }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Connected receives in</p>
        </div>
      </div>
    </div>
  </div>
</template>
