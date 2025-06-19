<script setup lang="ts">
import { useFxStore, availableCountries, availableCurrencies, chargeTypes } from '@/store/fxStore'

const store = useFxStore()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">FX Scenario Configuration</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Charge Type -->
      <div>
        <label for="charge-type" class="block text-sm font-medium text-gray-700">Charge Type</label>
        <select
          id="charge-type"
          :value="store.chargeType"
          @change="store.chargeType = ($event.target as HTMLSelectElement).value"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="type in chargeTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>

      <!-- Platform Country -->
      <div>
        <label for="platform-country" class="block text-sm font-medium text-gray-700"
          >Platform Country</label
        >
        <select
          id="platform-country"
          :value="store.platformCountry"
          @change="store.setPlatformCountry(($event.target as HTMLSelectElement).value)"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="country in availableCountries" :key="country.code" :value="country.code">
            {{ country.name }}
          </option>
        </select>
      </div>

      <!-- Connected Account Country -->
      <div>
        <label for="connected-country" class="block text-sm font-medium text-gray-700"
          >Connected Acc. Country</label
        >
        <select
          id="connected-country"
          :value="store.connectedCountry"
          @change="store.setConnectedCountry(($event.target as HTMLSelectElement).value)"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="country in availableCountries" :key="country.code" :value="country.code">
            {{ country.name }}
          </option>
        </select>
      </div>

      <!-- Presentment Currency -->
      <div>
        <label for="presentment-currency" class="block text-sm font-medium text-gray-700"
          >Presentment Currency</label
        >
        <select
          id="presentment-currency"
          :value="store.presentmentCurrency"
          @change="store.presentmentCurrency = ($event.target as HTMLSelectElement).value"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option
            v-for="currency in availableCurrencies"
            :key="currency.code"
            :value="currency.code"
          >
            {{ currency.name }} ({{ currency.code }})
          </option>
        </select>
      </div>

      <!-- Platform Settlement Currency -->
      <div>
        <label for="platform-settlement-currency" class="block text-sm font-medium text-gray-700"
          >Platform Settlement</label
        >
        <select
          id="platform-settlement-currency"
          :value="store.platformSettlementCurrency"
          @change="store.platformSettlementCurrency = ($event.target as HTMLSelectElement).value"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option
            v-for="currency in availableCurrencies"
            :key="currency.code"
            :value="currency.code"
          >
            {{ currency.name }} ({{ currency.code }})
          </option>
        </select>
      </div>

      <!-- Connected Settlement Currency -->
      <div>
        <label for="connected-settlement-currency" class="block text-sm font-medium text-gray-700"
          >Connected Settlement</label
        >
        <select
          id="connected-settlement-currency"
          :value="store.connectedSettlementCurrency"
          @change="store.connectedSettlementCurrency = ($event.target as HTMLSelectElement).value"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option
            v-for="currency in availableCurrencies"
            :key="currency.code"
            :value="currency.code"
          >
            {{ currency.name }} ({{ currency.code }})
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
