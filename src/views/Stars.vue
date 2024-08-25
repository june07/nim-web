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
		<v-list v-model="recentStars" class="recent-list text-center">
			<v-list-item v-for="star in recentStars" :key="star.starred.id" class="animate__animated animate__fadeIn">
				<v-list-item-title>Starred by
                    <a :href="star.starred.html_url" target="_blank" rel="noopener">
                        <v-chip size="x-small" color="green">
                            <span class="text-black">{{ star.starred.full_name }}</span>
                            <template v-slot:prepend>
                                <v-img class="mr-2" src="/github-mark.svg" width="16" height="16" />
                            </template>
                        </v-chip>
                    </a>
                </v-list-item-title>
				<v-list-item-subtitle><span class="reflected">Starred by</span>
                    <a :href="star.starred.html_url" target="_blank" rel="noopener">
                        <v-chip size="x-small" color="green">
                            <span class="text-black">{{ star.reflected.full_name }}</span>
                            <template v-slot:prepend>
                                <v-img class="mr-2" src="/github-mark.svg" width="16" height="16" />
                            </template>
                        </v-chip>
                    </a>
                </v-list-item-subtitle>
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
import { io } from 'socket.io-client'
import { ref, getCurrentInstance, onMounted } from 'vue'

import ProgressStar from '../components/ProgressStar.vue'

const stats = ref()
const { $api } = getCurrentInstance().appContext.config.globalProperties
const { VITE_APP_API_SERVER } = import.meta.env
const recentStars = ref([])

async function asyncInit() {
	const updatedStats = await $api.starStats()

	stats.value = updatedStats || stats.value
}
const sio = io(VITE_APP_API_SERVER + '/stellar-reflection', {
	transports: ['websocket'],
})
sio.on('connect', () => {
	console.info('connected to account namespace')
})
	.on('connect_error', error => {
		emit('error', error.message)
	})
	.on('star', payload => {
		recentStars.value.push(payload)
        stats.value.created = Number(stats.value.created) + 1
        if (recentStars.value.length > 10) {
            recentStars.value.shift()
        }
	})
onMounted(() => {
	asyncInit()
})
</script>
