<script setup lang="ts">
import {
  useFxStore,
  availableCountries,
  availableCurrencies,
  chargeTypes,
  feePayerOptions,
} from '@/store/fxStore'

const store = useFxStore()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
    <h2 class="text-lg font-semibold text-gray-900 mb-6">FX Scenario Configuration</h2>

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
