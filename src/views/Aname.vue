<template>
	<v-container fluid class="py-0 news-cycle-regular">
		<aname-header :username="username" />
		<v-form ref="form">
			<v-sheet color="grey-lighten-2" class="font-weight-bold mx-auto my-4 pa-4" :class="smAndDown ? 'w-100' : 'w-75'">
				<v-text-field variant="solo" flat v-model="params.seed" label="seed" :rules="rules.seed" @keydown.enter="callAPI" :placeholder="v4()" />
				<v-sheet rounded="lg" class="mb-4 pa-2">
					<v-tooltip location="top" aria-label="dictionaries tooltip" :open-on-click="smAndDown">
						<p class="mb-2">Dicionaries can be passed in as objects or strings.</p>
						<p class="mb-2">Objects shall be in the format of { ['dictionary name']: 'wsv list of terms where compound terms are separated by a hyphen' }.</p>
						<p class="mb-2">Strings should be hrefs to plaintext files following the same format as above (wsv list of terms where compound terms are separated by a hyphen), with the added detail that the file should be a single line.</p>
						<template v-slot:activator="{ props: tooltip }">
							<div class="font-weight-light text-grey-darken-2 ml-2 alabel">
								dictionaries
								<v-icon v-bind="tooltip" color="yellow-darken-2" icon="info" class="ml-2" style="cursor: pointer; pointer-events: auto" />
							</div>
						</template>
					</v-tooltip>
					<v-chip-group column>
						<draggable v-model="validDictionaries" @change="dictionaryOrderChanged" class="d-flex flex-column" item-key="name">
							<template #item="{ element: item, index }">
								<v-chip class="dictionary" :key="item" closable draggable :data-name="dictionaryAsName(item)" :ripple="false" @click:close="closeDictionaryHandler(item)">
									<div class="text-caption">{{ dictionaryAsName(item) }}</div>
									<template v-slot:prepend>
										<v-chip class="mr-2 ml-n2 font-weight-bold" size="x-small" :text="index + 1" />
									</template>
									<template v-slot:append>
										<v-chip class="ml-1 mr-n1 font-weight-bold" label v-if="store.aname.metadata[dictionaryAsName(item)]?.words" size="x-small" :text="store.aname.metadata[dictionaryAsName(item)].words" />
									</template>
								</v-chip>
							</template>
						</draggable>
						<v-progress-linear
							class="my-auto mr-2"
							ref="dictionaryValidationProgressRef"
							v-for="dict of [...params.dictionaries.filter(dict => unvalidatedDictionaries.includes(dictionaryAsName(dict)))]"
							style="height: 30px; max-width: 200px"
							rounded
							:indeterminate="!dictionaryValidationStatus[dict]"
							:color="dictionaryValidationStatus[dict] === 'failed' ? 'red' : 'green'"
							:id="dictionaryAsName(dict)">
							<div class="text-caption validation-progress-label">validating dictionary</div>
						</v-progress-linear>
						<v-chip key="control" class="text-uppercase dictionary-control text-blue-darken-2" :ripple="false" @click="dialogs.addDictionary = true" text="add" prepend-icon="add">
							<template v-slot:append>
								<v-chip class="mx-2 font-weight-bold text-caption" label size="x-small" :text="`${store.aname.availableDictionaries?.filter(dict => typeof dict === 'string').length} available`" />
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
									<p class="mb-2">Entropy mode controls how the suffix length is determined.</p>
									<p class="mb-2">When disabled, the suffix length represents the exact number of digits in base 10, ensuring predictable and user-friendly output.</p>
									<p class="mb-2">When enabled, the suffix length is directly tied to the entropy of the underlying hash, preserving randomness by selecting a fixed number of hex characters before conversion.</p>
									<p class="mb-2">This mode is useful for applications requiring precise entropy retention rather than strictly formatted numerical suffixes.</p>
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
								<p class="mb-2">You can <span class="text-uppercase text-grey">download</span> your key pair as a json file, <span class="text-uppercase text-grey">copy</span> the public key, or <span class="text-uppercase text-grey">reset</span> the public key to match the stored public key.</p>
								<p class="mb-2">Your private key is unique to your device, is not shared between devices, and does not leave your device.</p>
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
							<v-tooltip text="Copied public key to clipboard" v-model="tooltips['copy']" location="top" :open-on-hover="false" aria-label="Copied public key tooltip">
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
					<v-btn @click="callAPI('lookup')" :text="!didLookup ? 'lookup' : 'retreived'" class="mx-auto d-flex mb-2" :color="!didLookup ? 'blue' : 'green'" :disabled="didLookup" :size="didLookup ? 'small' : 'large'" v-else :style="styleObjs['didLookupBtn']" />
					<v-chip style="position: absolute; top: 6px; left: 6px" color="green" class="d-flex align-center animate__animated animate__bounceIn" label v-if="stats?.count">
						<v-btn class="text-caption" variant="text" :text="`Used ${stats.count}/${stats.max}`" @click="dialogs.names = true" />
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
								<p class="mb-2">The template flag is used to define the format of your generated name, including which dictionary(s) to use and in what order, and the separator between each dictionary term.</p>
								<p class="mb-2">Each template segment should be a string that references either the name of the included dictionary or an href to the dictionary.</p>
								<p class="mb-2">Dicionaries can be passed in as objects or strings.</p>
								<template v-slot:activator="{ props: tooltip }">
									<div class="alabel mb-4">
										template
										<v-icon v-bind="tooltip" color="yellow-darken-2" icon="info" class="ml-2" style="cursor: pointer; pointer-events: auto" />
									</div>
								</template>
							</v-tooltip>
						</div>
						<div style="font-size: 0.75rem" class="d-flex flex-wrap">
							<div v-for="(dictionary, index) of templateArr" class="d-flex align-center" :key="`${dictionary.name}-${index}`" style="position: relative">
								<v-sheet color="green" rounded="lg" class="segment px-1 py-2 animate__animated animate__bounceIn" :style="`animation-delay: ${1000/(templateArr.length - 1) * index}ms`">{{ dictionary.href || dictionary.name }}</v-sheet>
								<v-sheet color="green" rounded="lg" class="segment px-2 py-2 animate__animated animate__bounceIn" :style="`animation-delay: ${1000/(templateArr.length - 1) * index}ms`" v-if="index < templateArr.length - 1" :key="params.separator">{{ params.separator }}</v-sheet>
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
				<p class="mb-4">Your unique name has been <span class="font-weight-bold">deterministically</span> generated!🔥</p>
				<p class="mb-4">
					This means that as long as you provide the same input, you'll always get the same name—no pseudo-randomness games, no duplicates, no hassle!✨ Keep your real user IDs private and opting for personalized usernames instead with zero managment effort. Say goodbye to the hassle and extra processing
					required to track/store name data.
				</p>
				<p class="mb-4">Perfect for <span class="font-weight-bold">cross-platform identity, gamertags, and branding</span>🔗</p>
				<p>Create a <b>free</b> account to keep your name and unlock more features like <span class="font-weight-bold">additional API calls, shorter names, and more</span>!🗝️</p>
				<div class="mb-16 ml-4 text-caption font-italic font-weight-thin">(note: your username will be recycled after 24 hours if you don't create an account)</div>

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
		<add-dictionary-dialog v-model="dialogs.addDictionary" :selected="params.dictionaries" @update:modelValue="value => (dialogs.addDictionary = value)" @update:dictionary="dictionary => addDictionary(dictionary)" />
		<names-dialog v-model="dialogs.names" :names="stats.names" />
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
import { ref, computed, onBeforeMount, onMounted, watch, inject, getCurrentInstance, nextTick } from 'vue'
import { v5 as uuidv5, v4 } from 'uuid'
import { useAppStore } from '@/store/app'
import { ed25519 } from '@noble/curves/ed25519'
import { bytesToHex } from '@noble/curves/abstract/utils'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import draggable from 'vuedraggable'
import Swal from 'sweetalert2'
import 'animate.css'

import UrlVisualizer from '../components/UrlVisualizer.vue'
import AnameHeader from '../components/AnameHeader.vue'
import AddDictionaryDialog from '../components/aname/AddDictionaryDialog.vue'
import NamesDialog from '../components/aname/NamesDialog.vue'

const { smAndDown } = useDisplay()
const { $keycloak } = getCurrentInstance().appContext.config.globalProperties
const swalHtmlRef = ref()
const tabs = ref()
const clipboard = inject('clipboard')
const { MODE, VITE_APP_API_SERVER } = import.meta.env
const form = ref()
const url = ref()
const username = ref()
const unvalidatedDictionaries = ref([])
const dictionaryValidationStatus = ref({})
const validDictionaries = computed(() => params.value.dictionaries.filter(dict => !unvalidatedDictionaries.value.includes(dictionaryAsName(dict))))
const uuid = computed(() => {
	if (!url.value) return

	const uuid = uuidv5(url.value, uuidv5.URL)

	return uuid
})
const dialogs = ref({
	addDictionary: false,
	names: false,
})
const dictionaryValidationProgressRef = ref([])
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
// prettier-ignore
const rules = ref({
	salt: [v => !v || (v && v.length <= 21) || 'Salt must be less than 21 characters'],
	seed: [
        v => !!v || 'Seed is required',
        v => (v && `${v}`.length <= 100) || 'Seed must be less than 100 characters'
    ],
	dictionaries: [
        v => !!v || 'At least one dictionary is required',
        v => (v && v.length > 0 && v.length <= 5) || 'A maximum of 5 dictionaries is supported.'
    ],
	separator: [
        v => !!v || 'Separator is required',
        v => !!v || (v && v.length == 1) || 'Separator must be exactly 1 character',
        v => (v && /^[-_:.|,;+# ]$/.test(v)) || 'Separator must be one of the following: - _ : . | , ; + # space'
    ],
	suffixLength: [
        v => !!v || 'Suffix Length is required',
        v => (v && v >= 0 && v <= 21) || 'Suffix Length must be a positive number between 0 and 21 inclusive'
    ],
	publicKey: [
        v => !!v || 'Public key is required',
        v => v.length === 64 || 'Public key must be 32 bytes (Hex: 64 chars)'
    ],
})
const styleObjs = computed(() => ({
	generatedBtn: canGenerate.value
		? {}
		: {
				position: 'absolute',
				top: '6px',
				right: '6px',
		  },
	didLookupBtn: didLookup.value
		? {
				position: 'absolute',
				top: '6px',
				right: '6px',
		  }
		: {},
}))
const params = ref({
	entropyMode: store.aname.entropyMode,
	dictionaries: ['https://github.june07.com/dictionary/adjs.txt', 'https://github.june07.com/dictionary/colors.txt', 'https://github.june07.com/dictionary/nouns.txt'],
	template: `${encodeURIComponent('https://github.june07.com/dictionary/adjs.txt')}-${encodeURIComponent('colors')}-${encodeURIComponent('https://github.june07.com/dictionary/nouns.txt')}`,
	separator: store.aname.separator,
	suffixLength: store.aname.suffixLength,
	seed: store.aname.generated.length ? '' : store.aname.seed,
	publicKey: store.aname.publicKey,
	nocache: MODE === 'production' ? false : true,
})
const role = computed(() => $keycloak.value?.isAuthenticated && $keycloak.value.resourceAccess?.['ai'].roles.find(role => role.startsWith('aname')))
// prettier-ignore
const plans = computed(() => [
	{
		name: 'Free',
		price: 0,
		type: 'free',
		features: [
            'permanent names',
            'CDN name caching',
            'up to <b>100</b> guaranteed unique names',
            'unlimited lookups',
            'use up to 5 custom dictionaries',
            'API token support for use with other services',
        ],
		to: `/signin?action=register&redirect=${window.location.origin}/aname`,
		buttonText: /free/i.test(role.value) ? '' : 'Get Started',
		disabled: !!role.value,
	},
	{
		name: 'Developer',
		price: 1000,
		type: 'developer',
		features: [
            '<b>Everything in free version</b>',
            'up to <b>1,000</b> names',
            'developer sandbox',
            'custom namespaces',
            'multiple key pairs per account'
        ],
		href: 'https://buy.stripe.com/14k7vw4Nn0pP4ZafZ1',
		buttonText: /free/i.test(role.value) ? 'Upgrade' : 'Get Started',
		disabled: /developer|pro/i.test(role.value),
	},
	{
		name: 'Pro',
		price: 1999,
		type: 'pro',
		features: [
            '<b>Everything in developer version</b>',
            'up to <b>10,000</b> names',
            'priority support',
        ],
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
	store.aname.availableDictionaries
		.filter(dictionary => typeof dictionary === 'string')
		.forEach(dictionary => {
			if (store.aname.metadata[dictionary]?.words?.length) return

			fetch(dictionary)
				.then(response => response.text())
				.then(str => {
					// Allow a single trailing newline but remove it before validation
					str = str.trimEnd()

					// Ensure only valid word characters, hyphens, and whitespace exist
					if (!/^[\w-]+(\s[\w-]+)*$/.test(str)) {
						console.error('Invalid format: Contains invalid characters or incorrect spacing')
						return
					}

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
function dictionaryOrderChanged({ moved }) {
	if (!moved) return
	const { newIndex, oldIndex } = moved

	const [movedItem] = params.value.dictionaries.splice(oldIndex, 1)
	params.value.dictionaries.splice(newIndex, 0, movedItem)
}
function closeDictionaryHandler(item) {
	const index = params.value.dictionaries.findIndex(dict => dict === item)

	params.value.dictionaries.splice(index, 1)
}
function validateDictionary(dictionary) {
	unvalidatedDictionaries.value.push(dictionary)

	return new Promise((resolve, reject) => {
		fetch(dictionary)
			.then(response => response.text())
			.then(str => {
				// Allow a single trailing newline but remove it before validation
				str = str.trimEnd()

				// Ensure only valid word characters, hyphens, and whitespace exist
				if (!/^[\w-]+(\s[\w-]+)*$/.test(str)) {
					console.error('Invalid format: Contains invalid characters or incorrect spacing')
					return
				}

				setTimeout(() => {
					unvalidatedDictionaries.value.splice(unvalidatedDictionaries.value.indexOf(dictionary), 1)
					// timeout to allow the dictionaryValidationProgressRef.value index element to be found
				}, 50)

				dictionaryValidationStatus.value[dictionary] = 'succeded'
			})
			.catch(error => {
				console.log('error: ', error)
				dictionaryValidationStatus.value[dictionary] = 'failed'
			})
			.finally(() => {
				const index = dictionaryValidationProgressRef.value.findIndex(({ $el: el }) => el.id === dictionaryAsName(dictionary))
				const el = dictionaryValidationProgressRef.value[index].$el

				function animationendEvent() {
					el.removeEventListener('animationend', animationendEvent)
					dictionaryValidationStatus.value[dictionary] === 'succeded' ? resolve() : reject()
					setTimeout(() => {
						params.value.dictionaries = params.value.dictionaries.filter(dict => dict !== dictionary)
						unvalidatedDictionaries.value.splice(unvalidatedDictionaries.value.indexOf(dictionary), 1)
						dictionaryValidationStatus.value[dictionary] = undefined
					}, 3000)
				}
				el.addEventListener('animationend', animationendEvent)
				el.querySelector('.validation-progress-label').innerHTML = dictionaryValidationStatus.value[dictionary] === 'succeded' ? 'validated' : 'invalid'
				el.querySelector('.validation-progress-label').classList.add('animate__animated', 'animate__bounceIn')
			})
	})
}
function dictionaryAsName(dictionary) {
	return typeof dictionary === 'string' ? dictionary : Object.keys(dictionary)[0]
}
async function addDictionary(dictionary) {
	dialogs.value.addDictionary = false

	// add it to the dictionaries list while we try to fetch it
	if (!params.value.dictionaries.includes(dictionary)) {
		params.value.dictionaries = [...params.value.dictionaries, dictionary]
	}

	try {
		// confirm that the fetch was successful and it's a valid dictionary
		await validateDictionary(dictionaryAsName(dictionary))

		// if it's valid then add it to the store
		const availableDictionaries = new Set(store.aname.availableDictionaries)

		availableDictionaries.add(dictionary)

		store.aname.availableDictionaries = Array.from(availableDictionaries)
	} catch (error) {
		console.error('Error fetching dictionary metadata:', error)
	}
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

	username.value = $keycloak.value.tokenParsed.preferred_username
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
	watch(
		() => params.value,
		params => {
			updateURL()
			store.aname.seed = params.seed
		},
		{ immediate: true, deep: true }
	)
})
</script>
