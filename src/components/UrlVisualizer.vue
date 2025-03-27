<template>
	<v-sheet width="100%" rounded="lg" class="pl-8 text-wrap ubuntu-condensed-regular" style="position: relative" :height="height">
		<v-text-field v-model="url" @input="parseURL" placeholder="Enter URL here" class="url-input" readonly variant="solo" density="compact" hide-details flat style="position: absolute; top: 0; left: 0">
			<template v-slot:prepend-inner>
				<v-tooltip :text="tooltipText" v-model="tooltip" aria-label="Copied Command Tooltip" attach location="top">
					<template v-slot:activator="{ props: tooltip }">
						<v-menu>
							<template v-slot:activator="{ props, isActive }">
								<v-btn variant="tonal" v-bind="props" :append-icon="isActive ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" size="small">
									<span class="text-caption text-uppercase">cli</span>
									<template v-slot:prepend>
										<v-icon icon="content_copy" size="small"></v-icon>
									</template>
								</v-btn>
							</template>
							<v-list>
								<v-list-item v-for="(command, index) in commands" :key="index" :value="index" density="compact" @click="copyHandler(command.str)">
									<template v-slot:prepend>
                                        <v-icon v-if="command.icon" :icon="command.icon" size="20" class="mr-n4" />
										<v-img v-if="command.img" :src="command.img" width="20" class="mr-4" />
									</template>
									<v-list-item-title class="text-body-2">{{ command.title }}</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</template>
				</v-tooltip>
			</template>
		</v-text-field>
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
			<div class="section" v-if="urlParts.hash">
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
.ubuntu-condensed-regular {
	font-family: 'Ubuntu Condensed', sans-serif;
	font-weight: 400;
	font-style: normal;
}
.url-input {
	width: 100%;
	padding: 5px;
	margin-bottom: 10px;
}
.section {
	display: flex;
	cursor: pointer;
}
.label {
	margin-right: 6px;
	font-weight: bold;
	color: #007acc;
}
.value {
	overflow-wrap: anywhere;
}
.error {
	color: red;
}
</style>

<script setup>
import { ref, onMounted, watch, inject, computed } from 'vue'

const {
    MODE
} = import.meta.env
const emit = defineEmits(['update'])
const props = defineProps({
	url: String,
    height: String,
	apikey: String,
})
const clipboard = inject('clipboard')
const url = ref(props.url)
const urlParts = ref()
const condensed = ref({
	query: true,
	qp: true,
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
// prettier-ignore
const commands = computed(() => [
	{
		title: 'Copy URL',
		icon: 'content_copy',
		str: url.value,
	},
    {
		title: 'Copy as curl (bash)',
		img: 'terminal.svg',
		str: !url.value.endsWith('/stats') && `curl ${MODE !== 'production' ? '-k' : ''} '${url.value}'${props.apikey ? ` \\\n  -H 'x-api-key: ${props.apikey}'` : ''}`,
	},
	{
		title: 'Copy as curl (cmd)',
		img: 'cmd.svg',
		str: !url.value.endsWith('/stats') && `curl ${MODE !== 'production' ? '-k' : ''} ^"${url.value}^" ${props.apikey && `^\n  -H ^"x-api-key: ${props.apikey}^"`}`,
	},
	{
		title: 'Copy as fetch',
		img: 'fetch.svg',
		str: !url.value.endsWith('/stats') && `fetch("${url.value}", {\n  method: "GET",\n  headers: {\n    "x-api-key": "${props.apikey}"\n  }\n})`,
	},
])
const tooltip = ref(false)
const tooltipText = ref()
function copyHandler(command) {
	clipboard.copy(command).then(copied => {
		tooltip.value = copied
        tooltipText.value = `Copied ${command === url.value ? 'URL' : 'command'} to the clipboard`
		if (copied) {
			setTimeout(() => (tooltip.value = false), 1500)
		}
	})
}
onMounted(() => {
	watch(() => props.url, parseURL, { immediate: true })
})
</script>
