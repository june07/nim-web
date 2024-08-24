<template>
	<v-container class="h-100 d-flex flex-column align-center justify-center">
		<div class="title animate__animated animate__fadeIn text-center">
			<div class="d-flex">
				Automatically give
				<div @mouseleave="randomlyReanimate">
					<div class="starred">
						<div class="star1 animate__animated animate__heartBeat">⭐</div>
						<div class="star2 animate__animated animate__heartBeat">⭐</div>
						<div class="star3 animate__animated animate__heartBeat">⭐</div>
					</div>
				</div>
				back those who give them to you.
			</div>
			<div class="d-flex justify-center align-center">Install the <a class="text-caption font-weight-bold mx-2" href="https://github.com/apps/stellar-reflection" target="_blank" rel="noopener">Stellar Reflection</a> GitHub App</div>
		</div>
		<progress-star :stats="stats" />
	</v-container>
</template>
<style scoped>
.title {
	position: absolute;
	top: 170px;
}
.starred {
	letter-spacing: -1em;
	display: inline-flex;
    margin-right: 22px;
    margin-left: 2px;
}

.star1 {
	--animate-duration: 2s;
	--animate-delay: 0.5s;
	transform: rotate(-7deg);
}

.star2 {
	--animate-duration: 1s;
	--animate-delay: 0.2s;
	transform: rotate(7deg);
}

.star3 {
	--animate-duration: 3s;
	--animate-delay: 1s;
}
</style>
<script setup>
import 'animate.css'
import { ref, getCurrentInstance, onMounted } from 'vue'

import ProgressStar from '../components/ProgressStar.vue'

const stats = ref()
const { $api } = getCurrentInstance().appContext.config.globalProperties

async function asyncInit() {
	const updatedStats = await $api.starStats()

	stats.value = updatedStats || stats.value
}
onMounted(() => {
	asyncInit()
})
</script>
