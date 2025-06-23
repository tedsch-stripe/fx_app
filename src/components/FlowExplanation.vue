<script setup lang="ts">
import { computed } from 'vue'
import { useFxStore } from '@/store/fxStore'

const store = useFxStore()

const explanationSteps = computed(() => {
  const {
    chargeType,
    presentmentCurrency,
    platformSettlementCurrency,
    connectedSettlementCurrency,
  } = store

  const steps: string[] = []

  if (chargeType === 'direct') {
    steps.push(
      `A customer is charged <strong>100 ${presentmentCurrency}</strong>. With a Direct Charge, this charge is created directly on the Connected Account.`,
    )

    const connectedNeedsFx = presentmentCurrency !== connectedSettlementCurrency
    if (connectedNeedsFx) {
      steps.push(
        `Because the Connected Account settles in <strong>${connectedSettlementCurrency}</strong>, the <strong>100 ${presentmentCurrency}</strong> charge is converted, resulting in a credit to the Connected Account's balance.`,
      )
    } else {
      steps.push(
        `The Connected Account also settles in <strong>${presentmentCurrency}</strong>, so no currency conversion is needed for the main charge amount.`,
      )
    }

    steps.push(
      `From this charge, a <strong>10% application fee</strong> is collected by the Platform.`,
    )

    const platformNeedsFx = connectedSettlementCurrency !== platformSettlementCurrency
    if (platformNeedsFx) {
      steps.push(
        `The application fee, now in <strong>${connectedSettlementCurrency}</strong>, is converted to the Platform's settlement currency of <strong>${platformSettlementCurrency}</strong> before being credited to the Platform's balance.`,
      )
    } else {
      steps.push(
        `Because the Platform also settles in <strong>${connectedSettlementCurrency}</strong>, no currency conversion is needed for the application fee.`,
      )
    }

    steps.push(
      `After Stripe fees and taxes are deducted, the net amount is paid out to the Connected Account's external bank account in <strong>${connectedSettlementCurrency}</strong>, and the application fee is paid out to the Platform's bank account in <strong>${platformSettlementCurrency}</strong>.`,
    )
  } else if (chargeType === 'destination') {
    steps.push(
      `A customer is charged <strong>100 ${presentmentCurrency}</strong>. With a Destination Charge, this charge is created on the <strong>Platform Account</strong>.`,
    )

    const platformNeedsFx = presentmentCurrency !== platformSettlementCurrency
    if (platformNeedsFx) {
      steps.push(
        `The charge is converted to the Platform's settlement currency of <strong>${platformSettlementCurrency}</strong>. After FX fees, this amount is added to the Platform's pending balance.`,
      )
    } else {
      steps.push(
        `Since the Platform also settles in <strong>${presentmentCurrency}</strong>, no currency conversion is needed at this stage.`,
      )
    }

    steps.push(
      `From the Platform's balance, a <strong>transfer</strong> is made to the Connected Account.`,
    )

    const connectedNeedsFx = platformSettlementCurrency !== connectedSettlementCurrency
    if (connectedNeedsFx) {
      steps.push(
        `The transferred amount, currently in <strong>${platformSettlementCurrency}</strong>, is converted to the Connected Account's settlement currency of <strong>${connectedSettlementCurrency}</strong>.`,
      )
    }

    steps.push(
      `Finally, the <strong>10% application fee</strong> is collected from the Connected Account's balance and the net amounts are paid out to both parties.`,
    )
  } else {
    steps.push(`Explanation for ${store.chargeType} is not yet implemented.`)
  }

  return steps
})
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Explanation</h3>
    <ul class="space-y-3 text-sm text-gray-700">
      <li v-for="(step, index) in explanationSteps" :key="index" class="flex items-start">
        <span
          class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5"
        >
          {{ index + 1 }}
        </span>
        <span v-html="step"></span>
      </li>
    </ul>
  </div>
</template>
