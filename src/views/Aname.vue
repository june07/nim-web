<template>
	<v-container fluid class="py-0 news-cycle-regular">
		<aname-header />
		<v-form ref="form">
			<v-sheet color="grey-lighten-2" class="font-weight-bold mx-auto my-4 pa-4" :class="smAndDown ? 'w-100' : 'w-75'">
				<v-text-field variant="solo" flat v-model="params.seed" label="seed" :rules="rules.seed" @keydown.enter="callAPI" />
				<v-sheet rounded="lg" class="mb-4 pa-2">
					<v-tooltip location="top" aria-label="dictionaries tooltip" :open-on-click="smAndDown">
						<p class="my-4">Dicionaries can be passed in as objects or strings.</p>
						<p class="my-4">Objects shall be in the format of { ['dictionary name']: 'wsv list of terms where compound terms are separated by a hyphen' }.</p>
						<p class="my-4">Strings should be hrefs to plaintext files following the same format as above (wsv list of terms where compound terms are separated by a hyphen), with the added detail that the file should be a single line.</p>
						<template v-slot:activator="{ props: tooltip }">
							<div class="font-weight-light text-grey-darken-2 ml-2 alabel">
								dictionaries
								<v-icon v-bind="tooltip" color="yellow-darken-2" icon="info" class="ml-2" style="cursor: pointer; pointer-events: auto" />
							</div>
						</template>
					</v-tooltip>
					<v-chip-group column @drop="dropHandler" @dragover.prevent>
						<!-- prettier-ignore -->
						<v-chip class="dictionary" v-for="(item, index) of params.dictionaries" :key="item" closable draggable :data-name="typeof item === 'object' ? Object.keys(item)[0] : item" :text="typeof item === 'object' ? Object.keys(item)[0] : item"
                            :ripple="false"
                            @dragstart="dragstartHandler($event, index)"
                            @click:close="closeDictionaryHandler(item)">
							<template v-slot:prepend>
								<v-chip class="mr-2 ml-n2 font-weight-bold" size="x-small" :text="index + 1" />
							</template>
							<template v-slot:append>
								<v-chip class="ml-auto font-weight-bold" label v-if="store.aname.metadata[typeof item.value === 'object' ? Object.keys(item.value)[0] : item.value]?.words" size="x-small" :text="store.aname.metadata[typeof item.value === 'object' ? Object.keys(item.value)[0] : item.value].words" />
							</template>
						</v-chip>
					</v-chip-group>
				</v-sheet>
				<div class="d-flex">
					<v-text-field variant="solo" flat v-model="params.separator" label="separator" class="w-25 mr-2" :rules="rules.separator" @keydown.enter="callAPI" />

					<div style="position: relative" class="d-flex w-25 mr-2">
						<v-text-field variant="solo" flat v-model="params.suffixLength" :rules="rules.suffixLength" @keydown.enter="callAPI">
							<template v-slot:label>
								<v-tooltip location="top" aria-label="dictionaries tooltip" :open-on-click="smAndDown">
									<p class="my-4">Entropy mode controls how the suffix length is determined.</p>
									<p class="my-4">When disabled, the suffix length represents the exact number of digits in base 10, ensuring predictable and user-friendly output.</p>
									<p class="my-4">When enabled, the suffix length is directly tied to the entropy of the underlying hash, preserving randomness by selecting a fixed number of hex characters before conversion.</p>
									<p class="my-4">This mode is useful for applications requiring precise entropy retention rather than strictly formatted numerical suffixes.</p>
									<template v-slot:activator="{ props: tooltip }">
										<div class="font-weight-light text-grey-darken-1" style="font-size: 0.5rem">
											suffixLength
											<v-icon v-bind="tooltip" color="yellow-darken-2" icon="info" style="cursor: pointer; pointer-events: auto" />
										</div>
									</template>
								</v-tooltip>
							</template>
						</v-text-field>
						<v-checkbox-btn style="position: absolute; bottom: 30px; right: 6px" density="compact" v-model="params.entropyMode" />
					</div>

					<v-text-field variant="solo" flat v-model="store.aname.salt" label="salt" :rules="rules.salt" class="w-50" @keydown.enter="callAPI" />
				</div>
				<div class="d-flex mb-2">
					<v-text-field variant="solo" flat v-model="params.publicKey" :rules="rules.publicKey" class="w-50" id="publicKey" ref="keyRef" @keydown.enter="callAPI" :hint="keyHint" :persistent-hint="!!keyHint">
						<template v-slot:label>
							<span>public key</span>
							<v-tooltip location="top" aria-label="Public key input tooltip" :open-on-click="smAndDown">
								You can <span class="text-uppercase text-grey">download</span> your key pair as a json file, <span class="text-uppercase text-grey">copy</span> the public key, or <span class="text-uppercase text-grey">reset</span> the public key to match the stored public key.
								<template v-slot:activator="{ props: tooltip }">
									<v-icon v-bind="tooltip" color="yellow-darken-2" icon="info" class="ml-2" style="cursor: pointer; pointer-events: auto" />
								</template>
							</v-tooltip>
						</template>
						<template v-slot:append-inner>
							<v-tooltip text="Download key pair as json" v-model="tooltips['download']" location="top" aria-label="Download key pair tooltip">
								<template v-slot:activator="{ props: tooltip }">
									<v-btn v-bind="tooltip" size="x-small" variant="tonal" text="download" class="mb-auto mt-2 mr-1" style="font-size: 0.5rem" @click="downloadHandler" />
								</template>
							</v-tooltip>
							<v-tooltip text="Copied" v-model="tooltips['copy']" location="top" :open-on-hover="false" aria-label="Copied Private Key tooltip">
								<template v-slot:activator="{ props: tooltip }">
									<v-btn v-bind="tooltip" size="x-small" variant="tonal" text="copy" class="mb-auto mt-2 mr-1" id="copyButton" style="font-size: 0.5rem" @click="copyHandler" />
								</template>
							</v-tooltip>
							<v-btn size="x-small" variant="tonal" text="reset" class="mb-auto mt-2" style="font-size: 0.5rem" @click="resetHandler" />
						</template>
					</v-text-field>
				</div>
				<v-sheet height="100" rounded="lg" class="d-flex flex-column justify-end" style="position: relative">
					<div class="text-center mb-auto mt-8" v-if="apiResponseData?.username" :class="canGenerate ? 'animate__animated animate__fadeOut' : ''">{{ apiResponseData.username }}</div>
					<v-btn @click="callAPI" :text="canGenerate ? 'generate' : 'generated'" class="mx-auto d-flex mb-2" :color="canGenerate ? 'blue' : 'green'" :disabled="!canGenerate || !form.isValid" :size="!canGenerate ? 'small' : 'large'" v-if="tabs === 'generate'" :style="styleObjs['generatedBtn']" />
					<v-btn @click="callAPI('lookup')" :text="!didLookup ? 'lookup' : 'retreived'" class="mx-auto d-flex mb-2" :color="!didLookup ? 'blue' : 'green'" :disabled="didLookup" :size="didLookup ? 'small' : 'large'" v-else :style="styleObjs['generatedBtn']" />
					<v-chip style="position: absolute; top: 6px; left: 6px" color="green" class="d-flex align-center animate__animated animate__bounceIn" label v-if="stats?.count">
						<div class="text-caption">Used {{ stats.count }}/{{ stats.max }}</div>
						<template v-slot:append>
							<v-progress-circular class="ml-2" width="2" :model-value="(stats?.count / stats?.max) * 100" size="20"
								><div style="font-size: 0.4rem; font-weight: bold">{{ (stats?.count / stats?.max) * 100 }}%</div></v-progress-circular
							>
						</template>
					</v-chip>
				</v-sheet>
				<v-tabs v-model="tabs" fixed-tabs>
					<v-tab text="generate" value="generate"></v-tab>
					<v-tab text="lookup" value="lookup"></v-tab>
				</v-tabs>
				<v-tabs-window v-model="tabs">
					<v-tabs-window-item value="generate">
						<div class="text-caption text-center mt-8">
							<v-tooltip location="top" aria-label="Public key input tooltip" :open-on-click="smAndDown">
								<p>The template flag is used to define the format of your generated name, including which dictionary(s) to use and in what order, and the separator between each dictionary term.</p>
								<p class="my-4">Each template segment should be a string that references either the name of the included dictionary or an href to the dictionary.</p>
								<p class="my-4">Dicionaries can be passed in as objects or strings.</p>
								<template v-slot:activator="{ props: tooltip }">
									<div class="alabel mb-4">
										template
										<v-icon v-bind="tooltip" color="yellow-darken-2" icon="info" class="ml-2" style="cursor: pointer; pointer-events: auto" />
									</div>
								</template>
							</v-tooltip>
						</div>
						<div style="font-size: 0.75rem" class="d-flex flex-wrap">
							<div v-for="(dictionary, index) of templateArr" class="d-flex align-center" style="position: relative">
								<v-sheet color="green" rounded="lg" class="segment px-1 py-2">{{ dictionary.href || dictionary.name }}</v-sheet>
								<v-sheet color="green" rounded="lg" class="segment px-2 py-2" v-if="index < templateArr.length - 1">{{ params.separator }}</v-sheet>
								<v-chip style="position: absolute; top: -40%; left: 6px" :text="index + 1" />
							</div>
						</div>
						<div class="text-caption text-center mt-8">API call</div>
						<div style="font-size: 0.75rem" class="d-flex flex-wrap">
							<url-visualizer :url="url" :apikey="store.aname.apikeyData.key" />
						</div>
						<div class="text-caption text-center mt-8">fetch response data</div>
						<v-sheet color="black" rounded="lg" class="my-2 pa-2" height="500px" style="overflow-y: auto">
							<pre style="font-size: small; white-space: pre-wrap">{{ JSON.stringify(apiResponseData, null, '  ') }}</pre>
						</v-sheet>
					</v-tabs-window-item>
					<v-tabs-window-item value="lookup">
						<div class="text-caption text-center my-8">retreived data</div>
						<div class="d-flex flex-no-wrap justify-center">
							<div class="d-flex align-center stint-ultra-condensed-regular">
								<div style="position: relative">
									<v-sheet color="green" rounded="lg" class="segment px-1 py-2">{{ apiResponseData2?.slice(0, 13) || '\u003cretreived salt placeholder>' }}</v-sheet>
									<v-chip style="position: absolute; top: -40%; right: 6px" text="NaCl" />
								</div>
								<div style="position: relative">
									<v-sheet color="green" rounded="lg" class="segment px-2 py-2">{{ apiResponseData2?.slice(13) || '\u003cretreived seed placeholder>' }}</v-sheet>
									<v-chip style="position: absolute; top: -40%; right: 6px" text="Seed" />
								</div>
							</div>
						</div>
						<div class="text-caption text-center mt-8">API call</div>
						<div style="font-size: 0.75rem" class="d-flex flex-wrap">
							<url-visualizer :url="url2" />
						</div>
						<div class="text-caption text-center mt-8">fetch response data</div>
						<v-sheet color="black" rounded="lg" class="my-2 pa-2" height="500px" style="overflow-y: auto">
							<pre v-if="apiResponseData2" style="font-size: small; white-space: pre-wrap">{{ JSON.stringify(apiResponseData2, null, '  ') }}</pre>
							<div v-else class="text-overline d-flex justify-center align-center h-100">no data</div>
						</v-sheet>
					</v-tabs-window-item>
				</v-tabs-window>
			</v-sheet>
		</v-form>
		<v-card ref="swalHtmlRef" v-show="swalActive" rounded="xl" flat class="mb-8">
			<v-card-title>{{ store.aname.generated[uuid]?.data?.username || 'fake-transparent-name-placeholder' }}</v-card-title>
			<v-card-subtitle class="animate__animated animate__fadeIn animate__slower">Congratulations on your first generated name!</v-card-subtitle>
			<v-card-text class="text-start">
				<p class="my-4">Your unique name has been <span class="font-weight-bold">deterministically</span> generated! 🔥</p>
				<p class="my-4">This means that as long as you provide the same input, you'll always get the same name—no randomness, no duplicates, no hassle! ✨</p>
				<p class="my-4">Perfect for <span class="font-weight-bold">cross-platform identity, gamertags, and branding</span> without the hassle of tracking usernames manually. 🔗</p>
				<p class="my-4">Want even <span class="font-weight-bold">more control</span>? Unlock advanced features like <span class="font-weight-bold">more API calls, shorter names, and more</span> with Aname Pro! 🗝️</p>

				<v-item-group v-model="plansGroup" mandatory>
					<v-container>
						<v-row>
							<v-col class="pa-0" :cols="4" v-for="plan of plans" :key="plan">
								<v-item v-slot="{ isSelected, selectedClass, toggle }">
									<v-card class="d-flex flex-column mr-1 h-100" :color="isSelected ? 'blue-darken-4' : undefined" @click="toggle" rounded="xl" :class="selectedClass">
										<v-card-title class="text-h6 text-center font-weight-bold">
											{{ plan.name }}
										</v-card-title>
										<v-card-subtitle>
											{{ plan.description }}
										</v-card-subtitle>
										<v-card-text style="font-size: 0.65rem" class="ml-2 text-capitalize">
											<ul>
												<li v-for="feature of plan.features" :key="feature">
													<span v-html="feature"></span>
												</li>
											</ul>
										</v-card-text>
										<v-card-actions class="d-flex flex-column justify-end">
											<v-btn rounded variant="tonal" :color="isSelected ? 'white' : undefined" block :to="plan.to" :href="plan.href" :target="plan.href && '_blank'" :rel="plan.href && 'noopener'" :text="plan.buttonText" :disabled="plan.disabled" @click.stop />
										</v-card-actions>
									</v-card>
								</v-item>
							</v-col>
						</v-row>
					</v-container>
				</v-item-group>
			</v-card-text>
		</v-card>
		<v-snackbar v-model="snackbar.active" multi-line :timeout="snackbar.timeout" @mouseenter="snackbar.timeout = -1" @mouseleave="snackbar.timeout = 5000">
			<div class="text-caption">{{ snackbar.text }}</div>
			<template v-slot:actions>
				<v-btn color="red" variant="text" @click="snackbar.active = false"> Close </v-btn>
			</template>
		</v-snackbar>
	</v-container>
</template>
<style>
html {
	font-size: 1.5rem;
}
.news-cycle-regular {
	font-family: 'News Cycle', sans-serif;
	font-weight: 400;
	font-style: normal;
}

.news-cycle-bold {
	font-family: 'News Cycle', sans-serif;
	font-weight: 700;
	font-style: normal;
}
.stint-ultra-condensed-regular {
	font-family: 'Stint Ultra Condensed', serif;
	font-weight: 400;
	font-style: normal;
}
.saira-extra-condensed-thin {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 100;
	font-style: normal;
}

.saira-extra-condensed-extralight {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 200;
	font-style: normal;
}

.saira-extra-condensed-light {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 300;
	font-style: normal;
}

.saira-extra-condensed-regular {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 400;
	font-style: normal;
}

.saira-extra-condensed-medium {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 500;
	font-style: normal;
}

.saira-extra-condensed-semibold {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 600;
	font-style: normal;
}

.saira-extra-condensed-bold {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 700;
	font-style: normal;
}

.saira-extra-condensed-extrabold {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 800;
	font-style: normal;
}

.saira-extra-condensed-black {
	font-family: 'Saira Extra Condensed', sans-serif;
	font-weight: 900;
	font-style: normal;
}
</style>
<style scoped>
.alabel {
	font-size: 0.5rem;
	opacity: 0.6;
}
:deep(.v-chip__content) {
	overflow: hidden;
	font-size: 0.75rem;
}
.segment {
	margin: 1px;
}
:deep(.outer .v-chip__append) {
	margin-right: -6px;
	margin-left: 6px;
}
:deep(input#publicKey.text-green) {
	transition: color 1s ease;
}
:deep(.v-field__append-inner) {
	position: absolute;
	right: 0;
}
:deep(.v-overlay__content) {
	font-family: 'Saira Extra Condensed', sans-serif;
}
</style>
<script setup>
import { ref, computed, onBeforeMount, onMounted, watch, inject, getCurrentInstance } from 'vue'
import { v5 as uuidv5, v4 } from 'uuid'
import { useAppStore } from '@/store/app'
import { ed25519 } from '@noble/curves/ed25519'
import { bytesToHex } from '@noble/curves/abstract/utils'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import Swal from 'sweetalert2'
import 'animate.css'

import UrlVisualizer from '../components/UrlVisualizer.vue'
import AnameHeader from '../components/AnameHeader.vue'

const { smAndDown } = useDisplay()
const { $keycloak } = getCurrentInstance().appContext.config.globalProperties
const swalHtmlRef = ref()
const tabs = ref()
const clipboard = inject('clipboard')
const { MODE, VITE_APP_API_SERVER } = import.meta.env
const form = ref()
const url = ref()
const uuid = computed(() => {
	if (!url.value) return

	const uuid = uuidv5(url.value, uuidv5.URL)

	return uuid
})
const plansGroup = ref(0)
const canGenerate = computed(() => uuid.value && !store.aname.generated[uuid.value])
const didLookup = computed(() => uuid.value && !!store.aname.lookups[uuid.value])
const store = useAppStore()
const snackbar = ref({
	active: false,
	text: '',
})
const keyHint = computed(() => {
	return params.value.publicKey && store.aname.keypair.pub && params.value.publicKey !== store.aname.keypair.pub ? 'Note: This public key does not match the stored keypair.' : undefined
})
const stats = ref({})
const rules = ref({
	salt: [v => !v || (v && v.length <= 21) || 'Salt must be less than 21 characters'],
	seed: [v => !!v || 'Seed is required', v => (v && `${v}`.length <= 100) || 'Seed must be less than 100 characters'],
	dictionaries: [v => !!v || 'At least one dictionary is required', v => (v && v.length > 0 && v.length <= 5) || 'A maximum of 5 dictionaries is supported.'],
	separator: [v => !!v || 'Separator is required', v => !!v || (v && v.length == 1) || 'Separator must be exactly 1 character', v => (v && /^[-_:.|,;+# ]$/.test(v)) || 'Separator must be one of the following: - _ : . | , ; + # space'],
	suffixLength: [v => !!v || 'Suffix Length is required', v => (v && v >= 0 && v <= 21) || 'Suffix Length must be a positive number between 0 and 21 inclusive'],
	publicKey: [v => !!v || 'Public key is required', v => v.length === 64 || 'Public key must be 32 bytes (Hex: 64 chars)'],
})
const styleObjs = computed(() => ({
	generatedBtn: canGenerate.value
		? {}
		: {
				position: 'absolute',
				top: 0,
				right: 0,
		  },
}))
const availableDictionaries = ref(['https://github.june07.com/dictionary/adjs', 'https://github.june07.com/dictionary/colors', 'https://github.june07.com/dictionary/nouns', {
    colors: ['red', 'green', 'blue']
}])
const params = ref({
	entropyMode: store.aname.entropyMode,
	dictionaries: [
		'https://github.june07.com/dictionary/adjs',
        'https://github.june07.com/dictionary/colors',
		'https://github.june07.com/dictionary/nouns',
	],
	template: `${encodeURIComponent('https://github.june07.com/dictionary/adjs')}-${encodeURIComponent('colors')}-${encodeURIComponent('https://github.june07.com/dictionary/nouns')}`,
	separator: store.aname.separator,
	suffixLength: store.aname.suffixLength,
	seed: v4(),
	publicKey: store.aname.publicKey,
	nocache: MODE === 'production' ? false : true,
})
const role = computed(() => $keycloak.value?.isAuthenticated && $keycloak.value.resourceAccess?.['ai'].roles.find(role => role.startsWith('aname')))
const plans = computed(() => [
	{
		name: 'Free',
		price: 0,
		type: 'free',
		features: ['up to <b>100</b> guaranteed unique names', 'unlimited lookups'],
		to: `/signin?action=register&redirect=${window.location.origin}/aname`,
		buttonText: /free/i.test(role.value) ? '' : 'Get Started',
		disabled: !!role.value,
	},
	{
		name: 'Developer',
		price: 1000,
		type: 'developer',
		features: ['<b>Everything in free version</b>', 'up to <b>1,000</b> names', 'developer sandbox', 'custom namespaces'],
		href: 'https://buy.stripe.com/14k7vw4Nn0pP4ZafZ1',
		buttonText: /free/i.test(role.value) ? 'Upgrade' : 'Get Started',
		disabled: /developer|pro/i.test(role.value),
	},
	{
		name: 'Pro',
		price: 1999,
		type: 'pro',
		features: ['<b>Everything in developer version</b>', 'up to <b>10,000</b> names'],
		href: 'https://buy.stripe.com/00g3fg3JjgoN9fq6os',
		buttonText: /free|developer/i.test(role.value) ? 'Upgrade' : 'Get Started',
		disabled: /pro/i.test(role.value),
	},
])
const keyRef = ref()
const templateArr = computed(() => {
	const arr = params.value.dictionaries?.map(dictionary => ({
		name: typeof dictionary === 'object' ? Object.keys(dictionary)[0] : dictionary.split('/').pop(),
		href: typeof dictionary === 'object' ? undefined : dictionary,
	}))
	params.value.template = arr.map(d => encodeURIComponent(d.href || d.name)).join(params.value.separator)

	return arr
})
const swalActive = ref(false)
const apiResponseData = computed(() => uuid.value && store.aname.generated[uuid.value]?.data)
const apiResponseData2 = computed(() => uuid.value && store.aname.lookups[uuid.value])
const url2 = computed(() => new URL(`${VITE_APP_API_SERVER}/v1/ai/aname/${apiResponseData.value?.username || 'unique-name-placeholder'}?publicKey=${params.value.publicKey}`)?.href)
function updateURL() {
	const urlBase = new URL(`${VITE_APP_API_SERVER}/v1/ai/aname`)

	Object.keys(params.value || {}).forEach(key => {
		let value

		if (key === 'dictionaries') {
			value = JSON.stringify(params.value[key])
		} else if (key === 'seed') {
			value = `${store.aname.salt || ''}${params.value[key]}`
		} else {
			value = params.value[key]
		}

		if (value !== undefined) {
			urlBase.searchParams.append(key, value)
		}
	})

	url.value = urlBase.href
}
async function callAPI(action) {
	await $keycloak.value.isLoaded
	const token = await $keycloak.value.token

	if (action !== 'lookup') {
		fetch(url.value, {
			headers: token
				? {
						Authorization: `Bearer ${token}`,
				  }
				: {},
		})
			.then(response => response.json())
			.then(data => {
				if (data.error) {
					snackbar.value.text = data.error
					snackbar.value.active = true
					return
				}
				if (!store.aname.generated[uuid.value]) {
					if (!Object.keys(store.aname.generated).length) {
						swal()
					}
					store.aname.generated[uuid.value] = {
						url: url.value,
						data,
					}
				}
			})
			.catch(error => {
				console.error('Error fetching data:', error)
				snackbar.value.text = error.message
				snackbar.value.active = true
			})
	} else {
		fetch(url2.value)
			.then(async response => {
				const data = await response.text()

				if (response.ok) {
					if (data && !store.aname.lookups[uuid.value]) {
						store.aname.lookups[uuid.value] = data
					}
				} else {
					console.warn(data)
				}
			})
			.catch(error => {
				console.error('Error fetching data:', error)
				snackbar.value.text = error.message
				snackbar.value.active = true
			})
	}
}
async function updateMetadata() {
	availableDictionaries.value.forEach(dictionary => {
		if (store.aname.metadata[dictionary]?.words?.length) return

		fetch(dictionary)
			.then(response => response.text())
			.then(str => {
				store.aname.metadata[dictionary] = {
					words: str.split(/\s/).length,
				}
			})
			.catch(error => {
				console.error('Error fetching metadata:', error)
			})
	})
	params.value.dictionaries
		.filter(dictionary => typeof dictionary === 'object')
		.forEach(localDictionary => {
			const name = Object.keys(localDictionary)[0]
			const value = Object.values(localDictionary)[0]

			store.aname.metadata[name] = {
				words: value.length,
			}
		})
}
function generateKeyPair() {
	if (store.aname.keypair.priv) {
		return
	}

	const priv = ed25519.utils.randomPrivateKey()
	const pub = ed25519.getPublicKey(priv)
	const msg = new TextEncoder().encode('hello')
	const sig = ed25519.sign(msg, priv)
	ed25519.verify(sig, msg, pub) // Default mode: follows ZIP215
	ed25519.verify(sig, msg, pub, { zip215: false }) // RFC8032 / FIPS 186-5

	store.aname.keypair = {
		priv: bytesToHex(priv),
		pub: bytesToHex(pub),
	}
}
function resetHandler() {
	keyRef.value.classList.add('text-green')
	setTimeout(() => {
		keyRef.value.classList.remove('text-green')
	}, 1000)

	params.value.publicKey = store.aname.keypair.pub
}
const tooltips = ref({
	download: false,
	copy: false,
})
function copyHandler() {
	clipboard.copy(store.aname.keypair.pub).then(copied => {
		tooltips.value['copy'] = copied
		if (copied) {
			setTimeout(() => (tooltips.value['copy'] = false), 1500)
		}
	})
}
function downloadHandler() {
	const blob = new Blob([JSON.stringify(store.aname.keypair)], { type: 'text/json' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = 'keypair.json'
	link.click()
	URL.revokeObjectURL(url)
}
const drag = ref({
	startY: -1,
	startX: -1,
	endX: -1,
	endY: -1,
	startIndex: -1,
	endIndex: -1,
})
function dragstartHandler(event, index) {
	drag.value.startY = event.clientY
	drag.value.startIndex = index
	console.log('Drag start: ', drag.value.startIndex)
}

function dropHandler(event) {
	drag.value.endY = event.clientY
	drag.value.endX = event.clientX

	const yEndIndex = (drag.value.endY - drag.value.startY) / document.querySelector('.dictionary.v-chip').clientHeight
	const xEndIndex = (drag.value.endX - drag.value.startX) / document.querySelector('.dictionary.v-chip').clientWidth

	drag.value.endIndex = Math.max(xEndIndex, yEndIndex)

	if (drag.value.startIndex !== -1 && drag.value.endIndex !== -1) {
		reorderItems(params.value.dictionaries, drag.value.startIndex, drag.value.endIndex)
	}
}

function reorderItems(items, fromIndex, toIndex) {
	let adjustedToIndex = Math.round(toIndex)

	// Ensure the target index stays within valid bounds
	adjustedToIndex = Math.max(0, Math.min(items.length - 1, adjustedToIndex))

	if (fromIndex !== adjustedToIndex) {
		const [movedItem] = items.splice(fromIndex, 1)
		items.splice(adjustedToIndex, 0, movedItem)
	}
}
function closeDictionaryHandler(item) {
	const index = params.value.dictionaries.findIndex(dict => dict === item)

	params.value.dictionaries.splice(index, 1)
}
function swal(options = {}, func) {
	swalActive.value = true
	const effectiveOptions = {
		icon: 'success',
		color: 'white',
		background: 'rgba(255, 255, 255, 1)',
		confirmButtonColor: 'green',
		confirmButtonText: 'OK',
		html: swalHtmlRef.value.$el,
		...options,
	}
	Swal.fire(effectiveOptions).then(() => {
		swalActive.value = false
		func && func()
	})
}
async function asyncInit() {
	await $keycloak.value.isLoaded

    if (!$keycloak.value.isAuthenticated) return

	const { token } = await $keycloak.value
    
	// get count stats
	fetch(token && `${VITE_APP_API_SERVER}/v1/ai/aname/stats`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
		.then(response => response.json())
		.then(data => {
			stats.value = data.stats
		})
		.catch(error => {
			console.error('Error fetching metadata:', error)
		})

	if (token && !store.aname.apikeyData.key) {
		fetch(`${VITE_APP_API_SERVER}/v1/ai/aname/apikey`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(response => response.json())
			.then(data => {
				store.aname.apikeyData = data.apikey
			})
			.catch(error => {
				console.error('Error fetching metadata:', error)
			})
	}
}
onBeforeMount(() => {
	updateMetadata()
	generateKeyPair()
})
onMounted(() => {
	// swal()
	asyncInit()
	resetHandler()
	watch(() => params.value, updateURL, { immediate: true, deep: true })
})
</script>
