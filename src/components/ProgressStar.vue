<template>
	<div class="d-flex align-center justify-center">
		<div class="star-container">
			<!-- Star strokes -->
			<v-progress-linear v-for="(stroke, index) in strokes" :key="index" :model-value="strokeValues[`0-${index}`]" color="yellow" height="10" class="progress-bar" :style="stroke.style"></v-progress-linear>
		</div>
		<div class="star-container">
			<v-progress-linear v-for="(stroke, index) in strokes" :key="index" :model-value="strokeValues[`1-${index}`]" color="amber" height="10" class="progress-bar" :style="stroke.style" reverse></v-progress-linear>
		</div>
		<div ref="starCountRef" class="star-count" :class="animationPercentage == 1 ? 'star-count-loaded animate__animated animate__bounceIn' : ''">{{ starValue }}</div>
	</div>
</template>
<style scoped>
.star-container:nth-child(2) {
	transform: translateX(93px);
}
.star-container:nth-child(1) {
	position: absolute;
	transform: translateX(-93px) rotateY(180deg);
}
.star-container {
	position: relative;
	width: 100px;
	height: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.progress-bar {
	position: absolute;
	transform-origin: left center;
	width: 200%; /* Adjust to change the size of the star */
}
.star-count {
	position: absolute;
    margin-bottom: 70px;
    font-weight: bold;
    font-size: 3rem;
}
.star-count-loaded {
	position: absolute;
    margin-bottom: 70px;
    font-weight: bold;
    font-size: 5rem;
    color: #FFD700;
}
</style>
<script setup>
import 'animate.css'
import { ref, computed, onMounted, watch } from 'vue'

const starCountRef = ref()
const animationPercentage = ref(0)
const starValue = computed(() => props.stats?.created ? Math.floor(animationPercentage.value * props.stats.created) : 0)
const props = defineProps({
	stats: Object,
})
const strokes = ref([
	// Adjust each transform to match the correct angles for a 5-point star
	{ style: { transform: 'rotate(0deg) translateX(50%) rotate(-29deg)' } },
	{ style: { transform: 'rotate(72deg) translateX(50%) rotate(-29deg)' } },
	{ style: { transform: 'rotate(144deg) translateX(50%) rotate(-29deg)' } },
	{ style: { transform: 'rotate(220deg) translateX(50%) rotate(-29deg)' } },
	{ style: { transform: 'rotate(291deg) translateX(50%) rotate(-29deg)' } },
])
const strokeValues = ref({
	'0-0': 0,
	'1-0': 0,
	'0-1': 0,
	'1-1': 0,
	'0-2': 0,
	'1-2': 0,
	'0-3': 0,
	'1-3': 0,
	'0-4': 0,
	'1-4': 0,
})

const cubicBezier = t => {
	// Example of ease-in-out cubic bezier
	return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

// Animation logic using animatcss easing functions
const animate = () => {
	const duration = 2000 // Animation duration in ms
	const startTime = performance.now()

	const animateFrame = currentTime => {
		const elapsedTime = currentTime - startTime
		const progress = Math.min(elapsedTime / duration, 1) // Ensures progress never exceeds 1

		// Apply easing function to progress
		animationPercentage.value = cubicBezier(progress)
		updateStrokes()
		// console.log({ progress, animationPercentage: animationPercentage.value })

		if (progress < 1) {
			requestAnimationFrame(animateFrame)
		}
	}

	requestAnimationFrame(animateFrame)
}
function updateStrokes() {
	const percentageOfWholeStar = {
		'0-0': props.stats?.created && animationPercentage.value * 100 >= 10 ? animationPercentage.value * 100 : 0,
		'0-1': props.stats?.created && animationPercentage.value * 100 >= 20 ? animationPercentage.value * 100 : 0,
		'0-2': props.stats?.created && animationPercentage.value * 100 >= 30 ? animationPercentage.value * 100 : 0,
		'0-3': props.stats?.created && animationPercentage.value * 100 >= 40 ? animationPercentage.value * 100 : 0,
		'0-4': props.stats?.created && animationPercentage.value * 100 >= 50 ? animationPercentage.value * 100 : 0,
		'1-0': props.stats?.created && animationPercentage.value * 100 >= 60 ? animationPercentage.value * 100 : 0,
		'1-1': props.stats?.created && animationPercentage.value * 100 >= 70 ? animationPercentage.value * 100 : 0,
		'1-2': props.stats?.created && animationPercentage.value * 100 >= 80 ? animationPercentage.value * 100 : 0,
		'1-3': props.stats?.created && animationPercentage.value * 100 >= 90 ? animationPercentage.value * 100 : 0,
		'1-4': props.stats?.created && animationPercentage.value * 100 >= 99 ? animationPercentage.value * 100 : 0,
	}
	Object.keys(strokeValues.value).forEach((key, index) => {
		strokeValues.value[key] = percentageOfWholeStar[key]
	})
}
onMounted(() => {
	animate()
    watch(() => props.stats?.created, () => {
        starCountRef.value.classList.remove('animate__bounceIn')
        setTimeout(() => {
            starCountRef.value.classList.add('animate__bounceIn')
        })
    })
})
</script>
