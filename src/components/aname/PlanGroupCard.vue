<template>
	<v-card :style="xs ? 'width: 90vw' : ''" class="d-flex flex-column h-100 mx-3" :class="{ ...selectedClass, 'mr-1': !xs }" :color="isSelected ? 'blue-darken-4' : undefined" @click="toggle" rounded="xl" :flat="!isSelected">
		<v-chip style="position: absolute; top: 18px; right: 18px" :color="isSelected ? 'white' : 'blue-darken-4'" size="large" v-if="plan.chip1" :text="plan.chip1" rounded="lg" />
		<v-card-title class="text-h4 font-weight-bold mt-16">
			{{ plan.name }}
		</v-card-title>
		<v-card-subtitle class="text-wrap">
			{{ plan.description }}
		</v-card-subtitle>
		<v-card-text style="font-size: 0.65rem" class="ml-2 text-capitalize">
			<div class="d-flex font-weight-bold" style="font-size: 3rem">
				${{ /free/i.test(plan.name) ? '0' : '??' }}
				<div style="font-size: 1rem; margin-top: 0.5rem">.{{ /free/i.test(plan.name) ? '00' : '??' }}</div>
			</div>
            <div class="text-caption font-weight-light font-italic mt-n6 mb-4 text-grey" v-if="plan.suggestedPrice">suggested price {{ Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(plan.suggestedPrice/100) }}</div>
			<div class="text-body-1 font-weight-light">
                <div v-if="/free/i.test(plan.name)">Free for life</div>
				<div v-else><span class="font-weight-bold">Name</span> your own price... really.</div>
                <div v-if="/pro/i.test(plan.name)">Yes, you too Pros!</div>
			</div>
			<v-btn class="my-8" size="large" rounded="lg" variant="tonal" :color="isSelected ? 'white' : undefined" block :to="plan.to" :href="plan.href" :target="plan.href && '_blank'" :rel="plan.href && 'noopener'" :text="plan.buttonText" :disabled="plan.disabled" @click.stop />
			<ul class="ml-4" style="font-size: 1rem">
				<li v-for="feature of plan.features" :key="feature">
                    <v-icon icon="task_alt" class="ml-n4 pr-4" size="small" />
					<span v-html="feature"></span>
				</li>
			</ul>
		</v-card-text>
	</v-card>
</template>
<style scoped>
ul {
    list-style-type: none;
}
</style>
<script setup>
defineProps({
	plan: Object,
	xs: Boolean,
	isSelected: Boolean,
	selectedClass: String,
	toggle: Function,
})
</script>
