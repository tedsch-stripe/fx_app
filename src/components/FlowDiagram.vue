<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useFxStore } from '@/store/fxStore'
import mermaid from 'mermaid'

const store = useFxStore()
const diagramContainer = ref<HTMLDivElement | null>(null)
let mermaidInitialized = false

// The computed property that generates the Mermaid definition based on the store
const mermaidDefinition = computed(() => {
  const {
    chargeType,
    platformCountry,
    connectedCountry,
    presentmentCurrency,
    platformSettlementCurrency,
    connectedSettlementCurrency,
    getRate,
  } = store

  let definition = `graph LR
    classDef default fill:#fff,stroke:#cbd5e1,stroke-width:1px,font-family:Inter,font-size:14px,color:#334155
    classDef pi fill:#e0f2fe,stroke:#7dd3fc,color:#075985,font-weight:600
    classDef ch fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    classDef fx fill:#ffedd5,stroke:#fdba74,color:#9a3412,font-weight:600,rx:20,ry:20
    classDef fee fill:#f1f5f9,stroke:#94a3b8,color:#334155
    classDef bt fill:#d1fae5,stroke:#6ee7b7,color:#065f46,font-weight:600
  `

  if (chargeType === 'direct') {
    // --- Determine if FX is needed ---
    const connectedNeedsFx = presentmentCurrency !== connectedSettlementCurrency
    const platformNeedsFx = connectedSettlementCurrency !== platformSettlementCurrency

    // --- Calculations ---
    const chargeAmount = 100.0
    const appFee = 10.0

    const connectedRate = getRate(presentmentCurrency, connectedSettlementCurrency)
    const chargeFxAmount = chargeAmount * connectedRate
    const appFeeInConnectedCurrency = appFee * connectedRate
    const connectedNet = chargeFxAmount - appFeeInConnectedCurrency

    const platformRate = getRate(connectedSettlementCurrency, platformSettlementCurrency)
    const platformFeeFxAmount = appFeeInConnectedCurrency * platformRate

    // --- Build Diagram ---
    definition += `
      subgraph Customer
        PI("Payment Intent<br><b>${chargeAmount.toFixed(2)} ${presentmentCurrency}</b><br><span style='font-size:11px'>app_fee: ${appFee.toFixed(2)} ${presentmentCurrency}</span>");
      end
    `
    // --- Connected Account Subgraph ---
    definition += `
      subgraph "Connected Account (${connectedCountry})"
        CH("Charge<br><b>${chargeAmount.toFixed(2)} ${presentmentCurrency}</b>");
    `
    if (connectedNeedsFx) {
      definition += `
        FX1("FX<br>${presentmentCurrency} to ${connectedSettlementCurrency}<br><span style='font-size:11px'>Rate: ${connectedRate.toFixed(4)}</span>");
        CH_FX("Charge<br><b>${chargeFxAmount.toFixed(2)} ${connectedSettlementCurrency}</b>");
      `
    }
    definition += `
        PF("platform_fee<br><b>${appFeeInConnectedCurrency.toFixed(2)} ${connectedSettlementCurrency}</b>");
        BT_C("Balance<br><b>${connectedNet.toFixed(2)} ${connectedSettlementCurrency}</b>");
      end
    `
    // --- Platform Subgraph ---
    definition += `
      subgraph "Platform (${platformCountry})"
    `
    if (platformNeedsFx) {
      definition += `
        FX2("FX<br>${connectedSettlementCurrency} to ${platformSettlementCurrency}<br><span style='font-size:11px'>Rate: ${platformRate.toFixed(4)}</span>");
        PF_FX("platform_fee<br><b>${platformFeeFxAmount.toFixed(2)} ${platformSettlementCurrency}</b>");
      `
    }
    definition += `
        BT_P("Balance<br><b>${platformFeeFxAmount.toFixed(2)} ${platformSettlementCurrency}</b>");
      end
    `
    // --- Connections ---
    const chargeSettledNode = connectedNeedsFx ? 'CH_FX' : 'CH'
    const platformFeeSourceNode = platformNeedsFx ? 'PF_FX' : 'PF'

    definition += `
      PI --> CH
      ${connectedNeedsFx ? 'CH --> FX1 --> CH_FX' : ''}
      ${chargeSettledNode} --> BT_C
      ${chargeSettledNode} -.-> PF

      ${platformNeedsFx ? 'PF --> FX2 --> PF_FX' : ''}
      ${platformFeeSourceNode} --> BT_P
    `

    // --- Class Assignments ---
    definition += `
      class PI pi;
      class CH ${connectedNeedsFx ? 'ch' : 'bt'};
      class BT_C,BT_P bt;
      class PF ${platformNeedsFx ? 'fee' : 'bt'};
    `
    if (connectedNeedsFx) {
      definition += 'class CH_FX bt; class FX1 fx;'
    }
    if (platformNeedsFx) {
      definition += 'class PF_FX bt; class FX2 fx;'
    }
  } else {
    definition += `subgraph Placeholder; Z("Logic for ${store.chargeType} not implemented"); end`
  }
  return definition
})

const renderDiagram = async () => {
  if (!diagramContainer.value || !mermaidInitialized) {
    return
  }
  try {
    // Use a unique key for each render to avoid conflicts
    const uniqueId = `mermaid-svg-${Date.now()}`
    const { svg } = await mermaid.render(uniqueId, mermaidDefinition.value)
    diagramContainer.value.innerHTML = svg
  } catch (e) {
    console.error('Mermaid rendering error:', e)
    diagramContainer.value.innerHTML = '<p class="text-red-500 p-4">Error rendering diagram.</p>'
  }
}

onMounted(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    fontFamily: 'Inter, sans-serif',
    themeVariables: {
      background: '#FFFFFF',
      primaryColor: '#F0F4FF',
      primaryTextColor: '#334155',
      primaryBorderColor: '#C3DAFE',
      lineColor: '#94A3B8',
      textColor: '#334155',
    },
  })
  mermaidInitialized = true

  // Wait for the next DOM update cycle before the initial render
  nextTick(renderDiagram)
})

// Watch for changes in the definition and re-render the diagram
watch(mermaidDefinition, renderDiagram)
</script>

<template>
  <div ref="diagramContainer" class="w-full min-h-[300px] flex items-center justify-center">
    <!-- Mermaid SVG will be rendered here -->
  </div>
</template>
