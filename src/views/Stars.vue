<template>
	<v-container class="h-100 d-flex flex-column align-center justify-center">
		<div class="title animate__animated animate__fadeIn text-center">
			<div class="d-flex w-100">
				Automatically give
				<div @mouseleave="randomlyReanimate">
					<div class="starred">
						<div class="star1 animate__animated animate__heartBeat">⭐</div>
						<div class="star2 animate__animated animate__heartBeat">⭐</div>
						<div class="star3 animate__animated animate__heartBeat">⭐</div>
					</div>
				</div>
				back those who give them to you.
				<a class="font-weight-bold mr-2 ml-16" href="https://github.com/apps/stellar-reflection">
					<v-chip size="x-small" color="green">
						<span class="text-black">GitHub App</span>
						<template v-slot:prepend>
							<v-img class="mr-2" src="/github-mark.svg" width="16" height="16" />
						</template> </v-chip
				></a>
				<a class="font-weight-bold" href="https://june07.com/stellar-reflection">
					<v-chip size="x-small" color="grey">
						<span class="text-black">Blog Post</span>
						<template v-slot:prepend>
							<v-img class="mr-2" src="/SSPX0088.webp" width="16" height="16" />
						</template> </v-chip
				></a>
			</div>
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
