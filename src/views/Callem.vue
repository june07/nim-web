<template>
	<v-container class="h-100 d-flex flex-column align-center justify-center">
		<div v-show="whatTheyCallEm" v-if="randomlySortedDescriptions?.[0]" :key="randomlySortedDescriptions[0]" style="height: 100px; font-size: 3rem" class="animate__animated animate__fadeIn">
			{{ randomlySortedDescriptions[0] }}
		</div>
        <div v-else style="height: 100px; font-size: 3rem" :class="!randomlySortedDescriptions?.[0] ? 'animate__animated animate__zoomOut' : ''">
            {{ whatTheyCallEm?.[0]?.name }}
            What do <b>YOU</b> call em?
        </div>
		<div class="w-100">
			<v-text-field v-model="store.callem.form.name" label="Person's Name?" :placeholder="random.placeholder?.name" @update:model-value="get" />
			<v-textarea v-model="store.callem.form.description" label="What you call em?" :placeholder="random.placeholder?.description" rows="3" />
			<v-btn @click="set" text="callem" color="primary" :loading="loading" />
		</div>
	</v-container>
</template>
<style scoped></style>
<script setup>
import { ref, onMounted, computed, watch, onBeforeMount } from 'vue'
import { useAppStore } from '@/store/app'
import { io } from 'socket.io-client'
import 'animate.css'

const { VITE_APP_API_SERVER } = import.meta.env
const store = useAppStore()
const sio = ref()
const whatTheyCallEm = ref()
const loading = ref(false)
const timeout = ref()
const random = ref({
	placeholder: undefined,
})
const placeholders = ref([
	{ name: 'Raquel', description: 'The girl with the big breasts.' },
	{ name: 'Van Damme', description: 'The martial artist from the 90s that does the splits.' },
	{ name: 'Da Vinci', description: 'GOAT of invention and art.' },
	{ name: 'Bella Poarch', description: 'M to the B girl on TikTok.' },
	{ name: 'Elvis', description: 'The King of Rock and Roll.' },
	{ name: 'MJ', description: 'The King of Pop.' },
])
const randomlySortedDescriptions = ref()

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}
async function asyncInit() {
	ioInit()
}

function debounce(func) {
	if (timeout.value) clearTimeout(timeout.value)
	timeout.value = setTimeout(() => {
		func()
	}, 500)
}

async function _get() {
	if (!store.callem.form.name && !store.callem.form.description) return

	try {
		loading.value = true

		sio.value.emit(
			'get',
			{
				name: store.callem.form.name,
				description: store.callem.form.description,
			},
			async response => {
				const { data, error } = response

				if (data) {
					whatTheyCallEm.value = data
				}
			}
		)
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}
async function _set() {
	if (!store.callem.form.name && !store.callem.form.description) return

	try {
		loading.value = true

		sio.value.emit(
			'set',
			{
				name: store.callem.form.name,
				description: store.callem.form.description,
			},
			async response => {
				const { data, error } = response

				if (data) {
					whatTheyCallEm.value = data
				}
			}
		)
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}
function get() {
	return debounce(_get)
}
function set() {
	return debounce(_set)
}
function ioInit() {
	sio.value = io(VITE_APP_API_SERVER + '/callem', {
		transports: ['websocket'],
	})

	sio.value
		.on('connect', async () => {
			console.info('connected to namespace')
		})
		.on('ready', async () => {
			get()
		})
		.on('disconnect', reason => {
			console.info('disconnected from namespace: ', reason)
		})

	return sio.value
}
onBeforeMount(() => {
	asyncInit()
})
const interval = ref()
const lastDescriptions = ref()
onMounted(() => {
	random.value.placeholder = placeholders.value[Math.floor(Math.random() * placeholders.value.length)]

	watch(() => store.callem.form, get, { deep: true })
    watch(() => whatTheyCallEm.value, whatTheyCallEm => {
        if (JSON.stringify(lastDescriptions.value) === JSON.stringify(whatTheyCallEm?.[0]?.descriptions)) {
            return
        }

        lastDescriptions.value = whatTheyCallEm?.[0]?.descriptions

        randomlySortedDescriptions.value = shuffleArray(lastDescriptions.value)
        if (randomlySortedDescriptions.value?.length > 1) {
            if (interval.value) clearInterval(interval.value)
            interval.value = setInterval(() => {
                const description = randomlySortedDescriptions.value.pop()

                randomlySortedDescriptions.value.unshift(description)
            }, 5000)
        }
    }, { immediate: true })
})
</script>
