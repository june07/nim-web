<template>
	<v-container fluid class="py-0 news-cycle-regular">
		<v-form ref="form">
			<v-sheet color="grey-lighten-2 font-weight-bold w-75 mx-auto my-4 pa-4">
				<v-text-field variant="solo" flat v-model="params.seed" label="seed" :rules="rules.seed" @keydown.enter="callAPI" />
				<v-autocomplete variant="solo" flat chips closable-chips v-model="params.dictionaries" :items="availableDictionaries" :rules="rules.dictionaries" multiple @keydown.enter="callAPI">
					<template v-slot:label>
						<v-tooltip location="top" aria-label="dictionaries tooltip">
							<p class="my-4">Dicionaries can be passed in as objects or strings.</p>
							<p class="my-4">Objects shall be in the format of { ['dictionary name']: 'wsv list of terms where compound terms are separated by a hyphen' }.</p>
							<p class="my-4">Strings should be hrefs to plaintext files following the same format as above (wsv list of terms where compound terms are separated by a hyphen), with the added detail that the file should be a single line.</p>
							<template v-slot:activator="{ props: tooltip }">
								dictionaries
								<v-icon v-bind="tooltip" color="yellow-darken-2" icon="info" class="ml-2" style="cursor: pointer; pointer-events: auto" />
							</template>
						</v-tooltip>
					</template>
					<template v-slot:chip="{ item, index, props }">
						<div draggable="true" class="draggable-chip-wrapper" @dragstart="dragHandler(item, index)" @dragover.prevent @drop="dropHandler(index)">
							<v-chip v-bind="props" :text="typeof item.value === 'object' ? Object.keys(item.value)[0] : item.value" style="cursor: pointer" class="outer">
								<template v-slot:prepend>
									<v-chip class="mr-2 ml-n2 font-weight-bold" size="x-small" :text="index + 1">
										<template v-slot:close></template>
									</v-chip>
								</template>
								<template v-slot:append>
									<v-chip class="ml-auto font-weight-bold" label v-if="store.aname.metadata[typeof item.value === 'object' ? Object.keys(item.value)[0] : item.value]?.words" size="x-small" :text="store.aname.metadata[typeof item.value === 'object' ? Object.keys(item.value)[0] : item.value].words">
										<template v-slot:close></template>
									</v-chip>
								</template>
							</v-chip>
						</div>
					</template>
				</v-autocomplete>
				<div class="d-flex">
					<v-text-field variant="solo" flat v-model="params.separator" label="separator" class="w-25 mr-2" :rules="rules.separator" @keydown.enter="callAPI" />
					<v-text-field variant="solo" flat v-model="params.suffixLength" label="suffixLength" class="w-25 mr-2" :rules="rules.suffixLength" @keydown.enter="callAPI" />
					<v-text-field variant="solo" flat v-model="store.aname.salt" label="salt" :rules="rules.salt" class="w-50" @keydown.enter="callAPI" />
				</div>
				<div class="d-flex mb-2">
					<v-text-field variant="solo" flat v-model="store.aname.publicKey" :rules="rules.publicKey" class="w-50" id="publicKey" ref="keyRef" @keydown.enter="callAPI" :hint="keyHint" :persistent-hint="!!keyHint">
						<template v-slot:label>
							<span>public key</span>
							<v-tooltip location="top" aria-label="Public key input tooltip">
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
				<v-sheet height="100" rounded class="d-flex flex-column justify-end" style="position: relative">
					<div class="text-center mb-auto mt-8" v-if="apiResponseData?.username" :class="canGenerate ? 'animate__animated animate__fadeOut' : ''">{{ apiResponseData.username }}</div>
					<v-btn @click="callAPI" :text="canGenerate ? 'generate' : 'generated'" class="mx-auto d-flex mb-2" :color="canGenerate ? 'blue' : 'green'" :disabled="!canGenerate || !form.isValid" :size="!canGenerate ? 'small' : 'large'" v-if="tabs === 'generate'" :style="styleObjs['generatedBtn']" />
					<v-btn @click="callAPI('lookup')" :text="!didLookup ? 'lookup' : 'completed'" class="mx-auto d-flex mb-2" :color="!didLookup ? 'blue' : 'green'" :disabled="didLookup" :size="didLookup ? 'small' : 'large'" v-else />
				</v-sheet>
				<v-tabs v-model="tabs" fixed-tabs>
					<v-tab text="generate" value="generate"></v-tab>
					<v-tab text="lookup" value="lookup"></v-tab>
				</v-tabs>
				<v-tabs-window v-model="tabs">
					<v-tabs-window-item value="generate">
						<div class="text-caption text-center mt-8">
							<v-tooltip location="top" aria-label="Public key input tooltip">
								<p>The template flag is used to define the format of your generated name, including which dictionary(s) to use and in what order, and the separator between each dictionary term.</p>
								<p class="my-4">Each template segment should be a string that references either the name of the included dictionary or an href to the dictionary.</p>
								<p class="my-4">Dicionaries can be passed in as objects or strings.</p>
								<template v-slot:activator="{ props: tooltip }">
									template
									<v-icon v-bind="tooltip" color="yellow-darken-2" size="small" icon="info" class="ml-2" style="cursor: pointer; pointer-events: auto" />
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
							<url-visualizer :url="url" />
						</div>
						<div class="text-caption text-center mt-8">fetch response data</div>
						<v-sheet color="black" rounded class="my-2 pa-2" height="500px" style="overflow-y: auto">
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
						<v-sheet color="black" rounded class="my-2 pa-2" height="500px" style="overflow-y: auto">
							<pre v-if="apiResponseData2" style="font-size: small; white-space: pre-wrap">{{ JSON.stringify(apiResponseData2, null, '  ') }}</pre>
							<div v-else class="text-overline d-flex justify-center align-center h-100">no data</div>
						</v-sheet>
					</v-tabs-window-item>
				</v-tabs-window>
			</v-sheet>
		</v-form>
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
</style>
<style scoped>
.segment {
	margin: 1px;
}
:deep(.outer .v-chip__append) {
	margin-right: -6px;
	margin-left: 6px;
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
import { ref, computed, onBeforeMount, onMounted, watch, inject } from 'vue'
import { v5 as uuidv5 } from 'uuid'
import { useAppStore } from '@/store/app'
import { ed25519 } from '@noble/curves/ed25519'
import { bytesToHex } from '@noble/curves/abstract/utils'
import 'animate.css'

import UrlVisualizer from '../components/UrlVisualizer.vue'

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
const canGenerate = computed(() => uuid.value && !store.aname.generated[uuid.value])
const didLookup = computed(() => uuid.value && !!store.aname.lookups[uuid.value])
const store = useAppStore()
const snackbar = ref({
	active: false,
	text: '',
})
const keyHint = computed(() => {
	return store.aname.publicKey && store.aname.keypair.pub && store.aname.publicKey !== store.aname.keypair.pub ? 'Note: This public key does not match the stored keypair.' : undefined
})
const rules = ref({
	salt: [v => !v || (v && v.length <= 21) || 'Salt must be less than 21 characters'],
	seed: [v => !!v || 'Seed is required', v => (v && v.length <= 100) || 'Seed must be less than 100 characters'],
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
const availableDictionaries = ref(['https://github.june07.com/dictionary/adjs', 'https://github.june07.com/dictionary/colors', 'https://github.june07.com/dictionary/nouns'])
const params = ref({
	dictionaries: [
		'https://github.june07.com/dictionary/adjs',
		// prettier-ignore
		{ colors: ['aliceblue', 'almond', 'amaranth', 'amber', 'amethyst', 'apricot', 'aquamarine', 'azure', 'babyblue', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'bluegray', 'bluegreen', 'blueviolet', 'blush', 'brass', 'brickred', 'bronze', 'brown', 'buff', 'burgundy', 'burlywood', 'burntsienna', 'burntorange', 'cadetblue', 'camel', 'caramel', 'carnationpink', 'carolina', 'blue', 'celadon', 'cerise', 'cerulean', 'champagne', 'charcoal', 'chartreuse', 'cherryblossompink', 'chestnut', 'chocolate', 'cinnabar', 'cinnamon', 'cobalt', 'cobaltblue', 'coffee', 'coolgray', 'copper', 'coral', 'cornflowerblue', 'cornsilk', 'cream', 'crimson', 'cyan', 'dandelion', 'darkblue', 'darkbrown', 'darkbyzantium', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkpink', 'darkpurple', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkspringgreen', 'darkturquoise', 'darkviolet', 'deepblue', 'deepfuchsia', 'deepgreen', 'deeplilac', 'deepmagenta', 'deeporange', 'deeppink', 'deeppurple', 'deepskyblue', 'deepteal', 'deepviolet', 'denim', 'desert', 'dimgrey', 'dodgerblue', 'eggshell', 'electricblue', 'emerald', 'erin', 'fallow', 'fawn', 'fern', 'greenfieldfieldfloralwhite', 'forestgreen', 'frenchbeige', 'frenchblue', 'frenchlilac', 'fuchsia', 'gainsboro', 'gamboge', 'ghostwhite', 'gold', 'golden', 'goldenbrown', 'goldenrod', 'goldenyellow', 'gray', 'green', 'greenblue', 'greengray', 'greenyellow', 'gunmetal', 'hanblue', 'harlequin', 'harvestgold', 'heliotrope', 'honeydew', 'hotpink', 'iceblue', 'icterine', 'imperialred', 'inchworm', 'indiared', 'indigo', 'infrared', 'internationalorange', 'iris', 'isabelline', 'jade', 'jasmine', 'jazzberryjam', 'jonquil', 'junglegreen', 'kellygreen', 'khaki', 'lapislazuli', 'laserlemon', 'lavender', 'lavenderblush', 'lawngreen', 'lemon', 'lemonchiffon', 'lemonlime', 'lightblue', 'lightbrown', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightorange', 'lightpink', 'lightred', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow', 'lilac', 'lime', 'limegreen', 'lincoln', 'green', 'linen', 'lion', 'liver', 'liveryellow', 'macaroniandcheese', 'magenta', 'magicmint', 'magnolia', 'mahogany', 'maize', 'malachite', 'manatee', 'mandarin', 'mango', 'mantis', 'marigold', 'maroon', 'mauve', 'mauve', 'taupe', 'maygreen', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mikado', 'yellow', 'mintcream', 'mint', 'green', 'mistyrose', 'moccasin', 'moonstone', 'mossgreen', 'mountainmeadow', 'mulberry', 'mustard', 'myrtle', 'navajowhite', 'navy', 'navyblue', 'neon', 'neonblue', 'neongreen', 'neonorange', 'neonpink', 'neonpurple', 'neonyellow', 'nonphoto', 'blue', 'ochre', 'oldgold', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orangeyellow', 'orchid', 'outerspace', 'outrageousorange', 'oxblood', 'oxfordblue', 'paleblue', 'palebrown', 'palecarmine', 'palecerulean', 'palegold', 'palegoldenrod', 'palegreen', 'paleleaf', 'palemagenta', 'palepink', 'palesilver', 'paleskyblue', 'palespringbud', 'paletaupe', 'palevioletred', 'papayawhip', 'parisgreen', 'pastelblue', 'pastelgreen', 'pastelpink', 'pastelpurple', 'pastelred', 'pastelyellow', 'paynesgray', 'peach', 'peachcream', 'peachorange', 'peachpuff', 'peachesandcream', 'pear', 'pearl', 'periwinkle', 'persianblue', 'persiangreen', 'persianindigo', 'persianorange', 'persianpink', 'persianplum', 'persianred', 'persianrose', 'persimmon', 'pewter', 'phlox', 'phthalo', 'blue', 'phthalo', 'green', 'pictonblue', 'pink', 'pinklavender', 'pistachio', 'platinum', 'plum', 'portlandorange', 'powderblue', 'prussianblue', 'puce', 'pumpkin', 'purple', 'purpleblue', 'purplegray', 'purplemountainmajesty', 'purplered', 'purplesand', 'purpletaupe', 'quartz', 'queenblue', 'rackley', 'radicalred', 'raisinblack', 'raspberry', 'rawumber', 'razzle', 'dazzle', 'rose', 'razzmatazz', 'red', 'redbrown', 'redorange', 'redpurple', 'redviolet', 'richblack', 'richblue', 'richcarmine', 'richlavender', 'richlilac', 'richmaroon', 'riflegreen', 'robinseggblue', 'rose', 'rosebonbon', 'roseebony', 'rosegold', 'rosemadder', 'rosemist', 'rosepink', 'rosequartz', 'rosevale', 'rosewood', 'rosso', 'corsa', 'royalazure', 'royalblue', 'royalfuchsia', 'royalpurple', 'rubine', 'red', 'ruby', 'ruddy', 'ruddybrown', 'ruddypink', 'rufous', 'russet', 'rust', 'rustyred', 'sacramento', 'state', 'blue', 'saffron', 'sage', 'green', 'salmon', 'sand', 'sandstone', 'sandy', 'brown', 'sangria', 'sap', 'green', 'sapphire', 'scarlet', 'schoolbusyellow', 'sea', 'green', 'seagreen', 'sealbrown', 'seashell', 'selectiveyellow', 'sepia', 'shadow', 'shamrock', 'green', 'shockingpink', 'sienna', 'silver', 'sinopia', 'skobeloff', 'sky', 'blue', 'skymagenta', 'slateblue', 'slategray', 'smalt', 'smokeytopaz', 'smokybrown', 'snow', 'spacecadet', 'spanishbistre', 'spanishblue', 'spanishcarmine', 'spanishcrimson', 'spanishgray', 'spanishgreen', 'spanishorange', 'spanishpink', 'spanishpurple', 'spanishred', 'spanishskyblue', 'spanishviolet', 'spanishviridian', 'spring', 'bud', 'springgreen', 'steelblue', 'stil', 'de', 'grainyellow', 'straw', 'strawberry', 'suffolkpink', 'sunglow', 'sunset', 'tangelo', 'tangerine', 'tangerineyellow', 'taupe', 'taupegray', 'tawny', 'tea', 'teal', 'tealblue', 'tealgreen', 'tenne', 'terracotta', 'thistle', 'tiffanyblue', 'tomato', 'toolbox', 'tropicalrainforest', 'trueblue', 'tuftsblue', 'tulip', 'twilight', 'ultramarine', 'ultramarineblue', 'ultrared', 'umber', 'unitednationsblue', 'upforestgreen', 'upmaroon', 'utahcrimson', 'vanilla', 'vegasgold', 'venetianred', 'verdigris', 'vermilion', 'veronica', 'violet', 'violetblue', 'violetred', 'viridian', 'vividburgundy', 'vividauburn', 'vividcerise', 'vividtangerine', 'vividviolet', 'warmblack', 'waterspout', 'wenge', 'wheat', 'white', 'wildblueyonder', 'wildstrawberry', 'wildwatermelon', 'wisteria', 'xanadu', 'yale', 'blue', 'yellow', 'yellowgreen', 'yelloworange', 'yellowrose', 'zaffre', 'zomp', 'black', 'white', 'gray', 'navy', 'red', 'pink', 'orange', 'yellow', 'green', 'blue', 'purple', 'brown', 'beige', 'cream', 'gold', 'silver', 'aqua', 'azure', 'bisque', 'bronze', 'burgundy', 'cerulean', 'charcoal', 'cherry', 'chestnut', 'citrine', 'cobalt', 'copper', 'coral', 'crimson', 'cyan', 'ebony', 'eggshell', 'emerald', 'fuchsia', 'garnet', 'ginger', 'gold', 'grape', 'hazel', 'indigo', 'ivory', 'jade', 'khaki', 'lavender', 'lemon', 'lilac', 'lime', 'magenta', 'mahogany', 'maroon', 'mauve', 'mustard', 'olive', 'onyx', 'peach', 'periwinkle', 'pine', 'pink', 'plum', 'pumpkin', 'raspberry', 'rose', 'rust', 'saffron', 'sage', 'salmon', 'sand', 'sapphire', 'scarlet', 'silver', 'slate', 'tan', 'tangerine', 'taupe', 'teal', 'terracotta', 'turquoise', 'vermilion', 'violet', 'wheat', 'wine', 'yellow']},
		'https://github.june07.com/dictionary/nouns',
	],
	template: `${encodeURIComponent('https://github.june07.com/dictionary/adjs')}-${encodeURIComponent('colors')}-${encodeURIComponent('https://github.june07.com/dictionary/nouns')}`,
	separator: store.aname.separator,
	suffixLength: store.aname.suffixLength,
	seed: '8f729b1f-68c0-5e07-ba95-c99920d329df',
	publicKey: store.aname.publicKey,
	nocache: MODE === 'production' ? false : true,
})
const keyRef = ref()
const templateArr = computed(() => {
	const arr = params.value.dictionaries?.map(dictionary => ({
		name: typeof dictionary === 'object' ? Object.keys(dictionary)[0] : dictionary.split('/').pop(),
		href: typeof dictionary === 'object' ? undefined : dictionary,
	}))
	params.value.template = arr.map(d => encodeURIComponent(d.href || d.name)).join(params.value.separator)

	return arr
})
const apiResponseData = computed(() => uuid.value && store.aname.generated[uuid.value]?.data)
const apiResponseData2 = computed(() => uuid.value && store.aname.lookups[uuid.value])
const url2 = computed(() => new URL(`${VITE_APP_API_SERVER}/v1/ai/aname/${apiResponseData.value?.username || 'unique-name-placeholder'}?publicKey=${store.aname.publicKey}`)?.href)
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
	if (action !== 'lookup') {
		fetch(url.value)
			.then(response => response.json())
			.then(data => {
				if (!store.aname.generated[uuid.value]) {
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

	store.aname.publicKey = store.aname.keypair.pub
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
function dragHandler(e) {
	console.log(e)
	e.preventDefault()
}
function handleDrop(e) {
	const item = this.params.dictionaries.splice(this.index, 1)[0]
	// Update the position of the item in the array
	this.params.dictionaries.splice(this.newIndex, 0, item)
}
onBeforeMount(() => {
	updateMetadata()
	generateKeyPair()
	if (!store.aname.publicKey && store.aname.keypair.pub) {
		store.aname.publicKey = store.aname.keypair.pub
	}
})
onMounted(() => {
	watch(() => params.value, updateURL, { immediate: true, deep: true })
})
</script>
