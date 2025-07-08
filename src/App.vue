<script setup lang="ts">
import FxControls from './components/FxControls.vue'
import FlowDiagram from './components/FlowDiagram.vue'
import FlowExplanation from './components/FlowExplanation.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h1 class="text-2xl font-bold text-gray-900">FX Flow Analyzer</h1>
              <p class="text-sm text-gray-500">Stripe Connect Foreign Exchange Visualization</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Last updated: July 1, 2025</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- FX Scenario Configuration -->
      <FxControls />

      <!-- FX Flow Visualization & Explanation -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">FX Flow Visualization</h2>
        </div>

        <!-- Flow diagram will be rendered here -->
        <FlowDiagram />

        <hr class="my-6 border-gray-200" />

        <FlowExplanation />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Any additional custom styles if needed */
</style>
