<template>
	<v-container class="h-100 d-flex flex-column align-center justify-center">
		<div class="install-banner animate__animated animate__backInRight" style="position: absolute; top: 10px" v-if="lastInstall?.sender?.login">
			<span class="text-caption text-capitalize">last install by</span>
			<a class="font-weight-bold mx-2" :href="lastInstall.sender.html_url">
				<v-chip size="small" color="green">
					<span class="text-black">{{ lastInstall.sender.login }}</span>
					<template v-slot:prepend>
						<v-img class="mr-2" src="/github-mark.svg" width="16" height="16" />
					</template> </v-chip
			></a>
			<span class="text-caption text-capitalize">on {{ new Date(lastInstall.createdAt).toLocaleString() }}</span>
			<a class="font-weight-bold mx-2" href="https://github.com/june07/stellar-reflection/discussions/categories/star-reflections">
				<v-chip size="x-small" color="green">
					<span class="text-black">discussions</span>
					<template v-slot:prepend>
						<v-img class="mr-2" src="/github-mark.svg" width="16" height="16" />
					</template> </v-chip
			></a>
		</div>
		<div class="title animate__animated animate__fadeIn text-center d-flex flex-wrap justify-center mt-11 mx-4" style="position: absolute; top: 0" v-if="smAndDown">
			Automatically give
			<div @mouseleave="randomlyReanimate" @touchend="randomlyReanimate">
				<div class="starred">
					<div class="star1 animate__animated animate__heartBeat">⭐</div>
					<div class="star2 animate__animated animate__heartBeat">⭐</div>
					<div class="star3 animate__animated animate__heartBeat">⭐</div>
				</div>
			</div>
			back to those who give them to you.
		</div>
		<div class="title animate__animated animate__fadeIn text-center">
			<div class="d-flex w-100" :style="smAndDown ? 'font-size: 1rem' : ''">
				<div v-if="!smAndDown" class="d-flex">
					Automatically give
					<div @mouseleave="randomlyReanimate" @touchend="randomlyReanimate">
						<div class="starred">
							<div class="star1 animate__animated animate__heartBeat">⭐</div>
							<div class="star2 animate__animated animate__heartBeat">⭐</div>
							<div class="star3 animate__animated animate__heartBeat">⭐</div>
						</div>
					</div>
					back to those who give them to you.
				</div>
				<a class="font-weight-bold mr-2" :class="smAndDown ? '' : 'ml-16'" href="https://github.com/apps/stellar-reflection">
					<v-chip size="small" color="green">
						<span class="text-black">GitHub App</span>
						<template v-slot:prepend>
							<v-img class="mr-2" src="/github-mark.svg" width="16" height="16" />
						</template> </v-chip
				></a>
				<a class="font-weight-bold" href="https://june07.com/stellar-reflection">
					<v-chip size="small" color="grey">
						<span class="text-black">Blog Post</span>
						<template v-slot:prepend>
							<v-img class="mr-2" src="/SSPX0088.webp" width="16" height="16" />
						</template> </v-chip
				></a>
			</div>
		</div>
		<progress-star :stats="stats" />
		<v-list v-model="recentStars" class="recent-list text-center">
			<v-list-item v-for="star in recentStars" :key="star.starred.id" class="animate__animated animate__fadeIn">
				<v-list-item-title class="d-flex align-center justify-center">
					Starred by
					<a :href="star.starred.html_url" target="_blank" rel="noopener">
						<v-chip size="x-small" color="green">
							<span class="text-black">{{ star.starred.full_name }}</span>
							<template v-slot:prepend>
								<v-img class="mr-2" src="/github-mark.svg" width="16" height="16" />
							</template>
						</v-chip>
					</a>
					<v-chip size="x-small" variant="text" class="mt-1">
						stargazers: {{ star.starred.stargazers_count }}
						<template v-slot:prepend>
							<v-icon icon="star" color="amber" class="mr-1" />
						</template>
					</v-chip>
				</v-list-item-title>
				<v-list-item-subtitle class="d-flex align-center justify-center">
					<span class="reflected">Starred by</span>
					<a :href="star.reflected.html_url" target="_blank" rel="noopener">
						<v-chip size="x-small" color="green">
							<span class="text-black">{{ star.reflected.full_name }}</span>
							<template v-slot:prepend>
								<v-img class="mr-2" src="/github-mark.svg" width="16" height="16" />
							</template>
						</v-chip>
					</a>
					<v-chip size="x-small" variant="text" class="mt-1">
						stargazers: {{ star.reflected.stargazers_count }}
						<template v-slot:prepend>
							<v-icon icon="star" color="amber" class="mr-1" />
						</template>
					</v-chip>
				</v-list-item-subtitle>
				<template v-slot:append>
					<div class="text-caption ml-8">{{ new Date(star.updatedAt || Date.now()).toLocaleString() }}</div>
				</template>
			</v-list-item>
		</v-list>
	</v-container>
</template>
<style scoped>
.recent-list {
	opacity: 0.9;
	position: absolute;
	bottom: 100px;
}
.reflected {
	display: inline-block;
	transform: scaleY(-1);
}
.install-banner {
	z-index: 1;
}
.title {
	z-index: 1;
	position: absolute;
	top: 170px;
	font-family: 'Shadows Into Light', cursive;
	font-size: 1.5rem;
	font-weight: bold;
}
.starred {
	letter-spacing: -1em;
	display: inline-flex;
	margin-right: 40px;
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
import { io } from 'socket.io-client'
import { ref, getCurrentInstance, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

import ProgressStar from '../components/ProgressStar.vue'

const { smAndDown } = useDisplay()
const { $api } = getCurrentInstance().appContext.config.globalProperties
const { VITE_APP_API_SERVER } = import.meta.env
const recentStars = ref([])
const debounced = ref()
const stats = ref()
const lastInstall = ref()

async function asyncInit() {
	let index = 0
	const updatedStats = await $api.starStats()

	stats.value = updatedStats || stats.value
	lastInstall.value = Object.values(stats.value.recentInstalls)?.[index]
	if (lastInstall.value) {
		lastInstall.value = JSON.parse(lastInstall.value)
	}
}
const sio = io(VITE_APP_API_SERVER + '/stellar-reflection', {
	transports: ['websocket'],
})
sio.on('connect', () => {
	console.info('connected to /stellar-reflection namespace')
})
	.on('connect_error', error => {
		emit('error', error.message)
	})
	.on('star', payload => {
		// Remove any existing item with the same id
		const existingIndex = recentStars.value.findIndex(item => item.starred.id === payload.starred.id && item.reflected.id === payload.reflected.id)
		if (existingIndex !== -1) {
			recentStars.value.splice(existingIndex, 1) // Remove the existing item
		}

		// Ensure we maintain a maximum of 7 items
		if (recentStars.value.length >= 7) {
			recentStars.value.shift()
		}

		// Add the new item
		recentStars.value.push({
			...payload,
			updatedAt: Date.now(),
		})

		stats.value.created = Number(stats.value.created) + 1
	})
async function randomlyReanimate() {
	if (debounced.value) return
	debounced.value = setTimeout(() => {
		debounced.value = undefined
	}, 7000)
	const elements = document.querySelectorAll('.animate__animated.animate__heartBeat')

	await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 4000) + 3000))
	elements.forEach(element => {
		element.classList.remove('animate__animated', 'animate__heartBeat')
		setTimeout(() => {
			element.classList.add('animate__animated', 'animate__heartBeat')
		}, 50)
	})
}
onMounted(() => {
	asyncInit()
})
</script>
