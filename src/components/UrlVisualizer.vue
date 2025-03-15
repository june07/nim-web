<template>
	<v-sheet width="100%" rounded="lg" class="pl-8 text-wrap">
		<input v-model="url" @input="parseURL" placeholder="Enter URL here" class="url-input" />
		<div v-if="urlParts" class="details">
			<div class="section">
				<span class="label">Protocol:</span> <span class="value">{{ urlParts.protocol }}</span>
			</div>
			<div class="section">
				<span class="label">Host:</span> <span class="value">{{ urlParts.host }}</span>
			</div>
			<div class="section">
				<span class="label">Path:</span> <span class="value">{{ urlParts.pathname }}</span>
			</div>
			<div class="section">
				<span class="label">Query:</span> <span class="value" @click="condensed['query'] = !condensed['query']" :class="condensed['query'] ? 'text-no-wrap text-truncate' : ''">{{ urlParts.search || 'None' }}</span>
			</div>
			<div class="section">
				<span class="label">Fragment:</span> <span class="value">{{ urlParts.hash || 'None' }}</span>
			</div>
			<div v-if="urlParts.params.length" class="section flex-column">
				<div class="label">Query Parameters:</div>
				<ul>
					<li v-for="[key, value] in urlParts.params" :key="key" class="d-flex">
						<span class="value" @click="condensed['qp'] = !condensed['qp']" :class="condensed['qp'] ? 'text-no-wrap text-truncate' : ''">{{ key }} = {{ value }}</span>
					</li>
				</ul>
			</div>
		</div>
		<p v-else class="error">Invalid URL</p>
	</v-sheet>
</template>

<style>
.url-input {
	width: 100%;
	padding: 5px;
	margin-bottom: 10px;
}
.section {
    display: flex;
	margin-bottom: 8px;
    cursor: pointer;
}
.label {
    margin-right: 6px;
	font-weight: bold;
	color: #007acc;
}
.value {
    overflow-wrap: anywhere;
	font-family: monospace;
}
.error {
	color: red;
}
</style>

<script setup>
import { ref, onMounted, watch } from 'vue'

const emit = defineEmits(['update'])
const props = defineProps({
	url: String,
})
const url = ref(props.url)
const urlParts = ref()
const condensed = ref({
    query: true,
    qp: true
})

function parseURL(url) {
    if (!url) return

	try {
		const parsed = new URL(url)

		urlParts.value = {
			protocol: parsed.protocol,
			host: parsed.host,
			pathname: parsed.pathname,
			search: parsed.search,
			hash: parsed.hash,
			params: [...new URLSearchParams(parsed.search).entries()],
		}
		emit('update', { url, parsed })
	} catch (e) {
		urlParts.value = null
	}
}

onMounted(() => {
	watch(() => props.url, parseURL, { immediate: true })
})
</script>
