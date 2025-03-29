<template>
	<div>
		<v-item-group v-if="!xs" v-model="plansGroup" mandatory>
			<v-container class="px-0">
				<v-row>
					<v-col :cols="xs ? 12 : 4" class="pa-0" :class="xs ? 'mb-4' : ''" v-for="plan of plans" :key="plan">
						<v-item v-slot="{ isSelected, selectedClass, toggle }">
							<plan-group-card :plan="plan" :xs="xs" :isSelected="isSelected" :selectedClass="`${selectedClass}`" :toggle="toggle" />
						</v-item>
					</v-col>
				</v-row>
			</v-container>
		</v-item-group>
		<v-slide-group v-else v-model="plansGroup" mandatory center-active ref="slideGroupRef">
			<v-slide-group-item v-for="(plan, index) of plans" :key="plan" v-slot="{ isSelected, toggle, selectedClass }">
				<plan-group-card :plan="plan" :xs="xs" :isSelected="isSelected" :selectedClass="`${selectedClass}`" :toggle="toggle" :ref="el => setSlideRef(el, index)" />
			</v-slide-group-item>
		</v-slide-group>
	</div>
</template>
<script setup>
import { ref, computed, defineProps, onMounted, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'

import PlanGroupCard from './PlanGroupCard.vue'

const { xs } = useDisplay()
const props = defineProps({
	role: String,
})
const slides = ref([])
const observer = ref()
const plansGroup = ref(0)
const slideGroupRef = ref()
const lastIndex = ref(0)
const lastTimestamp = ref(0)
const swipeDirection = ref(null) // "forward" or "backward"
const plans = computed(() => [
	{
		name: 'Free',
        description: 'Basic name generation & management',
		suggestedPrice: 0,
		type: 'free',
		features: ['up to <b>100</b> permanent and guaranteed unique names', 'unlimited lookups', 'CDN name caching', 'use up to 5 dictionaries', 'use custom dictionaries', 'API token support for use with other services'],
		to: `/signin?redirect=${window.location.origin}/aname`,
		buttonText: /free/i.test(props.role) ? '' : 'Get Started',
		disabled: !!props.role,
        chip1: 'Free Forever',
	},
	{
		name: 'Developer',
        description: 'For developers and small projects',
		suggestedPrice: 1000,
		type: 'developer',
		features: ['<b>Everything in free version</b>', 'up to <b>1,000</b> names', 'developer sandbox', 'custom namespaces', 'multiple key pairs per account'],
		href: 'https://buy.stripe.com/14k7vw4Nn0pP4ZafZ1',
		buttonText: /free/i.test(props.role) ? 'Upgrade' : 'Get Started',
		disabled: /developer|pro/i.test(props.role),
        chip1: 'Great for Indi Devs',
	},
	{
		name: 'Pro',
        description: 'For businesses and large projects',
		suggestedPrice: 2000,
		type: 'pro',
		features: ['<b>Everything in developer version</b>', 'up to <b>10,000</b> names', 'priority support'],
		href: 'https://buy.stripe.com/00g3fg3JjgoN9fq6os',
		buttonText: /free|developer/i.test(props.role) ? 'Upgrade' : 'Get Started',
		disabled: /pro/i.test(props.role),
        chip1: 'Scale Up',
	},
])

const setSlideRef = (el, index) => {
	if (el) {
		slides.value[index] = el.$el
	}
}

const initObserver = () => {
	if (!slides.value.length) return

	const options = {
		root: slideGroupRef.value?.$el, // The container for the slides
		threshold: [0.2, 0.5, 0.75], // Different levels of visibility
	}

	observer.value = new IntersectionObserver(handleIntersect, options)
	slides.value.forEach(slide => observer.value.observe(slide))
}

const handleIntersect = entries => {
	let maxVisibleIndex = null
	let maxVisibleArea = 0
	const now = performance.now()

	entries.forEach(entry => {
		const index = slides.value.indexOf(entry.target)
		if (index !== -1) {
			const visibleArea = entry.intersectionRatio // Value between 0 and 1

			if (visibleArea > maxVisibleArea) {
				maxVisibleArea = visibleArea
				maxVisibleIndex = index
			}
		}
	})

	if (maxVisibleIndex !== null && maxVisibleIndex !== lastIndex.value) {
		// Determine swipe direction
		swipeDirection.value = maxVisibleIndex > lastIndex.value ? 'forward' : 'backward'
		const timeDiff = now - lastTimestamp.value

        if (timeDiff < 300) return
		if ((swipeDirection.value === 'forward' && maxVisibleIndex > lastIndex.value) || (swipeDirection.value === 'backward' && maxVisibleIndex < lastIndex.value)) {
			plansGroup.value = maxVisibleIndex
		}

		lastIndex.value = maxVisibleIndex
		lastTimestamp.value = now
	}
}

onMounted(() => {
	setTimeout(() => {
		initObserver()
	}, 50)
})

onBeforeUnmount(() => {
	if (observer.value) {
		observer.value.disconnect()
	}
})
</script>
