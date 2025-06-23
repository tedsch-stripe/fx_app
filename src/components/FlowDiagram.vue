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
    feePayer,
    getRate,
  } = store

  let definition = `graph LR
    classDef default fill:#fff,stroke:#cbd5e1,stroke-width:1px,font-family:Inter,font-size:14px,color:#334155
    classDef pi fill:#e0f2fe,stroke:#7dd3fc,color:#075985,font-weight:600
    classDef ch fill:#dbeafe,stroke:#93c5fd,color:#1e40af
    classDef fx fill:#ffedd5,stroke:#fdba74,color:#9a3412,font-weight:600,rx:20,ry:20
    classDef fee fill:#f1f5f9,stroke:#94a3b8,color:#334155
    classDef bt fill:#d1fae5,stroke:#6ee7b7,color:#065f46,font-weight:600
    classDef tr fill:#e0e7ff,stroke:#a5b4fc,color:#3730a3
  `

  if (chargeType === 'direct') {
    // --- Determine if FX is needed ---
    const connectedNeedsFx = presentmentCurrency !== connectedSettlementCurrency
    const platformNeedsFx = connectedSettlementCurrency !== platformSettlementCurrency

    // --- Calculations ---
    const chargeAmount = 100.0
    const appFee = 10.0
    const stripeFee = chargeAmount * 0.029 + 0.3 // Illustrative Stripe fee

    const connectedRate = getRate(presentmentCurrency, connectedSettlementCurrency)
    const connectedFxFee = connectedNeedsFx
      ? presentmentCurrency === 'USD' || connectedSettlementCurrency === 'USD'
        ? 0.01
        : 0.02
      : 0
    const chargeFxAmount = chargeAmount * connectedRate * (1 - connectedFxFee)
    const appFeeInConnectedCurrency = appFee * connectedRate * (1 - connectedFxFee)

    // Calculate platform rates and fees (needed for both scenarios)
    const platformRate = getRate(connectedSettlementCurrency, platformSettlementCurrency)
    const platformFxFee = platformNeedsFx
      ? connectedSettlementCurrency === 'USD' || platformSettlementCurrency === 'USD'
        ? 0.01
        : 0.02
      : 0
    const platformFeeFxAmount = appFeeInConnectedCurrency * platformRate * (1 - platformFxFee)

    // Calculate balances based on who pays the Stripe fee
    let connectedNet, platformNet, stripeFeeInConnectedCurrency, stripeFeeInPlatformCurrency

    if (feePayer === 'connected') {
      // Connected Account pays Stripe fee (original logic)
      stripeFeeInConnectedCurrency = stripeFee * connectedRate * (1 - connectedFxFee)
      connectedNet = chargeFxAmount - appFeeInConnectedCurrency - stripeFeeInConnectedCurrency
      platformNet = platformFeeFxAmount
      stripeFeeInPlatformCurrency = 0 // Not used in this scenario
    } else {
      // Platform pays Stripe fee
      stripeFeeInConnectedCurrency = 0 // Not used in this scenario
      connectedNet = chargeFxAmount - appFeeInConnectedCurrency
      stripeFeeInPlatformCurrency =
        stripeFee * connectedRate * platformRate * (1 - connectedFxFee) * (1 - platformFxFee)
      platformNet = platformFeeFxAmount - stripeFeeInPlatformCurrency
    }

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
      const fxFeePercent = connectedFxFee * 100
      definition += `
        FX1("FX<br>${presentmentCurrency} to ${connectedSettlementCurrency}<br><span style='font-size:11px'>Rate: ${connectedRate.toFixed(4)}<br>Fee: ${fxFeePercent}%</span>");
        CH_FX("Charge<br><b>${chargeFxAmount.toFixed(2)} ${connectedSettlementCurrency}</b>");
      `
    }
    definition += `
        PF("platform_fee<br><b>${appFeeInConnectedCurrency.toFixed(2)} ${connectedSettlementCurrency}</b>");
        ${feePayer === 'connected' ? `FEES("Stripe Fee<br><b>${stripeFeeInConnectedCurrency.toFixed(2)} ${connectedSettlementCurrency}</b>");` : ''}
        BT_C("Balance<br><b>${connectedNet.toFixed(2)} ${connectedSettlementCurrency}</b>");
      end
    `
    // --- Platform Subgraph ---
    definition += `
      subgraph "Platform (${platformCountry})"
    `
    if (platformNeedsFx) {
      const fxFeePercent = platformFxFee * 100
      definition += `
        FX2("FX<br>${connectedSettlementCurrency} to ${platformSettlementCurrency}<br><span style='font-size:11px'>Rate: ${platformRate.toFixed(4)}<br>Fee: ${fxFeePercent}%</span>");
        PF_FX("platform_fee<br><b>${platformFeeFxAmount.toFixed(2)} ${platformSettlementCurrency}</b>");
      `
    }
    definition += `
        ${feePayer === 'platform' ? `FEES_P("Stripe Fee<br><b>${stripeFeeInPlatformCurrency.toFixed(2)} ${platformSettlementCurrency}</b>");` : ''}
        BT_P("Balance<br><b>${platformNet.toFixed(2)} ${platformSettlementCurrency}</b>");
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
      ${feePayer === 'connected' ? `${chargeSettledNode} -.-> FEES` : ''}

      ${platformNeedsFx ? 'PF --> FX2 --> PF_FX' : ''}
      ${platformFeeSourceNode} --> BT_P
      ${feePayer === 'platform' ? `${platformFeeSourceNode} -.-> FEES_P` : ''}
    `

    // --- Class Assignments ---
    definition += `
      class PI pi;
      class CH ${connectedNeedsFx ? 'ch' : 'bt'};
      class BT_C,BT_P bt;
      class PF${feePayer === 'connected' ? ',FEES' : ''}${feePayer === 'platform' ? ',FEES_P' : ''} fee;
    `
    if (connectedNeedsFx) {
      definition += 'class CH_FX bt; class FX1 fx;'
    }
    if (platformNeedsFx) {
      definition += 'class PF_FX bt; class FX2 fx;'
    }
  } else if (chargeType === 'destination') {
    // --- Determine if FX is needed ---
    const platformNeedsFx = presentmentCurrency !== platformSettlementCurrency
    const connectedNeedsFx = platformSettlementCurrency !== connectedSettlementCurrency

    // --- Calculations ---
    const chargeAmount = 100.0
    const appFee = 10.0

    const platformRate = getRate(presentmentCurrency, platformSettlementCurrency)
    const platformFxFeePercent = platformNeedsFx
      ? presentmentCurrency === 'USD' || platformSettlementCurrency === 'USD'
        ? 0.01
        : 0.02
      : 0
    const chargeOnPlatformAfterFx = chargeAmount * platformRate * (1 - platformFxFeePercent)

    const stripeFee = chargeOnPlatformAfterFx * 0.029 + 0.3

    // The full post-FX amount is transferred
    const transferAmount = chargeOnPlatformAfterFx

    const connectedRate = getRate(platformSettlementCurrency, connectedSettlementCurrency)
    const connectedFxFeePercent = connectedNeedsFx
      ? platformSettlementCurrency === 'USD' || connectedSettlementCurrency === 'USD'
        ? 0.01
        : 0.02
      : 0
    const paymentOnConnectedAfterFx = transferAmount * connectedRate * (1 - connectedFxFeePercent)

    // App fee is taken from the connected account in its settlement currency.
    const appFeeInConnectedCurrencyRate = getRate(presentmentCurrency, connectedSettlementCurrency)
    const appFeeInConnectedCurrency = appFee * appFeeInConnectedCurrencyRate
    const connectedNet = paymentOnConnectedAfterFx - appFeeInConnectedCurrency

    // Platform receives the app fee in the connected account's settlement currency (no conversion)
    const platformAppFeeBalance = appFeeInConnectedCurrency
    const platformStripeFeeBal = -stripeFee

    // --- Build Diagram ---
    definition += `
      subgraph Customer
        PI("Payment Intent<br><b>${chargeAmount.toFixed(2)} ${presentmentCurrency}</b><br><span style='font-size:11px'>app_fee: ${appFee.toFixed(2)} ${presentmentCurrency}</span>");
      end

      subgraph "Platform (${platformCountry})"
        CH("Charge<br><b>${chargeAmount.toFixed(2)} ${presentmentCurrency}</b>");
        ${platformNeedsFx ? `FX1("FX<br>${presentmentCurrency} to ${platformSettlementCurrency}<br><span style='font-size:11px'>Rate: ${platformRate.toFixed(4)}<br>Fee: ${(platformFxFeePercent * 100).toFixed(0)}%</span>");` : ''}
        CH_FX("Charge<br><b>${chargeOnPlatformAfterFx.toFixed(2)} ${platformSettlementCurrency}</b>");
        TR("Transfer<br><b>-${transferAmount.toFixed(2)} ${platformSettlementCurrency}</b>");
        FEES("Stripe Fee<br><b>-${stripeFee.toFixed(2)} ${platformSettlementCurrency}</b>");
        BT_P_APP("Balance<br><b>+${platformAppFeeBalance.toFixed(2)} ${connectedSettlementCurrency}</b><br><span style='font-size:11px'>app_fee</span>");
        BT_P_STRIPE("Balance<br><b>${platformStripeFeeBal.toFixed(2)} ${platformSettlementCurrency}</b><br><span style='font-size:11px'>stripe_fee</span>");
      end

      subgraph "Connected Account (${connectedCountry})"
        ${connectedNeedsFx ? `FX2("FX<br>${platformSettlementCurrency} to ${connectedSettlementCurrency}<br><span style='font-size:11px'>Rate: ${connectedRate.toFixed(4)}<br>Fee: ${(connectedFxFeePercent * 100).toFixed(0)}%</span>");` : ''}
        PY_FX("Transfer<br><b>${paymentOnConnectedAfterFx.toFixed(2)} ${connectedSettlementCurrency}</b>");
        PF("platform_fee<br><b>-${appFeeInConnectedCurrency.toFixed(2)} ${connectedSettlementCurrency}</b><br><span style='font-size:11px'>from ${appFee.toFixed(2)} ${presentmentCurrency}</span>");
        BT_C("Balance<br><b>${connectedNet.toFixed(2)} ${connectedSettlementCurrency}</b>");
      end

      PI --> CH
      CH ${platformNeedsFx ? '--> FX1 --> CH_FX' : '--> CH_FX'}
      CH_FX --> TR & FEES

      TR ${connectedNeedsFx ? '--> FX2 --> PY_FX' : '--> PY_FX'}
      PY_FX --> BT_C
      PY_FX -.-> PF

      PF -.-> BT_P_APP
      FEES --> BT_P_STRIPE

      class PI pi; class CH,CH_FX,PY,PY_FX ch; class FX1,FX2 fx;
      class PF,FEES fee; class BT_C,BT_P_APP,BT_P_STRIPE bt; class TR tr;
    `
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
