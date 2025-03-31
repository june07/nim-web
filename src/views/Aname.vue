<template>
	<v-container fluid class="py-0 news-cycle-regular" :class="xs ? 'px-0' : ''" :style="xs ? 'min-width: 100vw; overflow-x: hidden' : 'max-width: 75vw'">
		<aname-header :username="username" @open:names="dialogs.names = true" @open:apikeys="dialogs.apikeys = true" />
		<v-card rounded="xl" flat class="mb-8">
			<v-card-title class="title saira-extra-condensed-extrabold font-weight-bold text-wrap">A Unique Deterministic Name Generator</v-card-title>
			<v-card-subtitle class="text-wrap saira-extra-condensed-light">Just provide a seed and we'll generate a name for you. A name that is guaranteed to be globally unique and repeatable.</v-card-subtitle>
		</v-card>
		<v-form ref="form">
			<v-sheet color="grey-lighten-2" class="font-weight-bold mx-auto my-4 px-1 pt-1" rounded="lg" :class="smAndDown ? 'w-100' : 'w-75'">
				<v-text-field variant="solo" flat v-model="params.seed" label="seed" :rules="rules.seed" @keydown.enter="callAPI" :placeholder="v4()" hide-details class="mb-1" @change="form.validate()" />
				<v-sheet rounded="lg" class="mb-1 pa-2">
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
					<v-input :model-value="params.dictionaries" :rules="rules.dictionaries" :error-messages="rules.dictionaries.map(r => r(params.dictionaries)).filter(msg => msg !== true)" class="d-flex flex-column">
						<v-chip-group column>
							<draggable v-model="validDictionaries" @change="dictionaryOrderChanged" class="d-flex flex-column" item-key="name" handle=".handle" :key="validDictionaries.length">
								<template #item="{ element: item, index }">
									<div class="handle w-100">
										<v-menu :model-value="dictionaryChangeMenu[index]">
											<v-select :items="store.aname.availableDictionaries.filter(dict => !params.dictionaries.includes(dict))" label="Available Dictionaries" variant="solo" flat density="compact" @update:modelValue="value => dictionaryChangeHandler(value, { item, index })" :menu="true">
												<template v-slot:item="{ props: itemProps, item }" lines="two">
													<v-list-item v-bind="itemProps" :title="dictionaryAsName(item.value).split('/').pop().replace('.txt', '')">
														<template v-slot:prepend>
															<v-icon icon="spellcheck" size="x-small" />
														</template>
														<template v-slot:subtitle>
															<div style="font-size: 0.75rem">
																<a v-if="dictionaryAsName(item.value).startsWith('http')" :href="dictionaryAsName(item.value)" target="_blank" rel="noopener noreferrer">{{ dictionaryAsName(item.value).replace(/https?:\/\//, '') }}</a>
																<div v-else class="d-flex text-wrap">{{ Object.values(item.value)[0].join(', ') }}</div>
															</div>
														</template>
													</v-list-item>
												</template>
											</v-select>
											<template v-slot:activator="{ props }">
												<v-chip v-bind="props" class="dictionary d-flex justify-space-between handle" style="max-width: 90vw" :key="item" closable draggable :data-name="dictionaryAsName(item)" :ripple="false" @click:close="closeDictionaryHandler(item)">
													<div class="text-truncate saira-extra-condensed-regular">{{ dictionaryAsName(item).replace(/https?:\/\//, '') }}</div>
													<template v-slot:prepend>
														<v-chip class="mr-2 ml-n2 font-weight-bold" size="x-small" :text="index + 1" />
													</template>
													<template v-slot:append>
														<v-chip class="font-weight-bold" label v-if="store.aname.metadata[dictionaryAsName(item)]?.words" size="x-small" :text="store.aname.metadata[dictionaryAsName(item)].words" />
													</template>
												</v-chip>
											</template>
										</v-menu>
									</div>
								</template>
							</draggable>
							<v-progress-linear
								class="my-auto mr-2"
								ref="dictionaryValidationProgressRef"
								v-for="dict of [...params.dictionaries.filter(dict => unvalidatedDictionaries.includes(dictionaryAsName(dict)))]"
								style="height: 30px; max-width: 90vw"
								rounded
								:indeterminate="!dictionaryValidationStatus[dict]"
								:color="dictionaryValidationStatus[dict] === 'failed' ? 'red' : 'green'"
								:id="dictionaryAsName(dict)">
								<div class="text-caption validation-progress-label">validating dictionary</div>
							</v-progress-linear>
							<v-chip key="control" class="text-uppercase dictionary-control text-blue-darken-2" :ripple="false" @click="dialogs.addDictionary = true" text="add" prepend-icon="add">
								<template v-slot:append>
									<v-chip class="mx-2 font-weight-bold text-caption" label size="x-small" :text="`${store.aname.availableDictionaries?.filter(dict => typeof dict === 'string' && !params.dictionaries.includes(dictionaryAsName(dict))).length} available`" />
								</template>
							</v-chip>
						</v-chip-group>
					</v-input>
				</v-sheet>
				<v-row>
					<v-col :cols="xs ? 4 : 3" class="d-flex pr-0">
						<v-text-field variant="solo" flat v-model="params.separator" label="separator" class="mr-1 mb-1" :rules="rules.separator" @keydown.enter="callAPI" hide-details @blur="params.separator = params.separator || defaultParams.separator" />
					</v-col>

					<v-col :cols="xs ? 4 : 3" class="d-flex px-0">
						<div style="position: relative" class="d-flex w-100 mr-1 mb-1">
							<v-text-field variant="solo" flat v-model="params.suffixLength" :rules="rules.suffixLength" @keydown.enter="callAPI" placeholder="3" hide-details @blur="params.suffixLength = params.suffixLength || defaultParams.suffixLength">
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
							<v-checkbox-btn style="position: absolute; bottom: 6px; right: 6px" density="compact" v-model="params.entropyMode" />
						</div>
					</v-col>

					<v-col :cols="xs ? 4 : 6" class="d-flex pl-0">
						<v-text-field variant="solo" flat v-model="store.aname.salt" label="salt" :rules="rules.salt" class="mb-1" @keydown.enter="callAPI" hide-details />
					</v-col>
				</v-row>
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
									<v-btn v-bind="tooltip" size="x-small" variant="tonal" text="copy" class="mb-auto mt-2 mr-1" id="copyButton" style="font-size: 0.5rem" @click="copyHandler(store.aname.keypair.pub, 'copy')" />
								</template>
							</v-tooltip>
							<v-btn size="x-small" variant="tonal" text="reset" class="mb-auto mt-2" style="font-size: 0.5rem" @click="resetHandler" />
						</template>
					</v-text-field>
				</div>
				<v-sheet height="120" rounded="lg" class="d-flex flex-column justify-end" style="position: relative">
					<div class="text-center mb-auto mt-8" v-if="apiResponseData?.name" :class="canGenerate ? 'animate__animated animate__fadeOut' : ''">{{ apiResponseData.name }}</div>
					<v-tooltip text="Copied name to clipboard" v-model="tooltips['name']" location="top" :open-on-hover="false" aria-label="Copied name tooltip">
						<template v-slot:activator="{ props: tooltip }">
							<v-btn v-if="apiResponseData?.name" v-bind="tooltip" size="x-small" variant="tonal" text="copy" id="copyNameButton" style="font-size: 0.5rem" @click="copyHandler(apiResponseData.name, 'name')" :style="styleObjs['copyNameBtn']" />
						</template>
					</v-tooltip>
					<v-btn @click="callAPI" :text="canGenerate ? 'generate' : 'generated'" class="mx-auto d-flex mb-2" :color="canGenerate ? 'blue' : 'green'" :disabled="!canGenerate || !form.isValid" :size="!canGenerate ? 'small' : 'large'" v-if="tabs === 'generate'" :style="styleObjs['generatedBtn']" />
					<v-btn @click="callAPI('lookup')" :text="!didLookup ? 'lookup' : 'retreived'" class="mx-auto d-flex mb-2" :color="!didLookup ? 'blue' : 'green'" :disabled="didLookup || !apiResponseData?.name" :size="didLookup ? 'small' : 'large'" v-else :style="styleObjs['didLookupBtn']" id="lookupBtn" />
					<v-chip style="position: absolute; top: 6px; left: 6px" color="green" class="d-flex align-center animate__animated animate__bounceIn" label v-if="stats?.count">
						<v-btn class="text-caption" variant="text" :text="`Used ${stats.count}/${stats.max}`" @click="dialogs.names = true" />
						<template v-slot:append>
							<v-progress-circular class="ml-2" width="2" :model-value="(stats?.count / stats?.max) * 100" size="20"
								><div style="font-size: 0.4rem; font-weight: bold">{{ Number((stats?.count / stats?.max) * 100).toFixed(0) }}%</div></v-progress-circular
							>
						</template>
					</v-chip>
				</v-sheet>
				<v-tabs v-model="tabs" fixed-tabs color="primary">
					<v-tab text="generate" value="generate">
						<v-btn variant="plain" text="generate" color="primary" :disabled="tabs === 'lookup'" />
					</v-tab>
					<v-tab text="lookup" value="lookup" id="lookupTab">
						<v-btn variant="plain" size="small" text="lookup" color="primary" :disabled="tabs === 'generate'" />
					</v-tab>
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
							<div v-for="(dictionary, index) of templateArr" class="d-flex align-center saira-extra-condensed-regular" :key="`${dictionary.name}-${index}`" style="position: relative">
								<v-sheet color="green" rounded="lg" class="text-truncate segment px-1 py-2 animate__animated animate__bounceIn" :style="`animation-delay: ${(1000 / (templateArr.length - 1)) * index}ms`">{{ dictionary.href || dictionary.name }}</v-sheet>
								<v-sheet color="green" rounded="lg" class="segment px-2 py-2 animate__animated animate__bounceIn" :style="`animation-delay: ${(1000 / (templateArr.length - 1)) * index}ms`" v-if="index < templateArr.length - 1" :key="params.separator">{{ params.separator }}</v-sheet>
								<v-chip class="font-weight-bold" style="position: absolute; top: -40%; left: 6px" :text="index + 1" />
							</div>
						</div>
						<div class="text-caption text-center mt-8">API call</div>
						<div style="font-size: 0.75rem" class="d-flex flex-wrap">
							<url-visualizer :url="url" :apikey="store.aname.apikeys[0]?.key" />
						</div>
						<div class="text-caption text-center mt-8">fetch response data</div>
						<v-sheet color="black" rounded="lg" class="my-2 pa-2" style="overflow-y: auto" :height="apiResponseData ? '500px' : '200px'">
							<pre v-if="apiResponseData" style="font-size: small; white-space: pre-wrap">{{ JSON.stringify(apiResponseData, null, '  ') }}</pre>
							<div v-else class="text-overline d-flex flex-column justify-center align-center h-100">no data</div>
						</v-sheet>
					</v-tabs-window-item>
					<v-tabs-window-item value="lookup">
						<div class="text-caption text-center my-8">retreived data</div>
						<div class="d-flex flex-no-wrap justify-center saira-extra-condensed-regular">
							<div style="position: relative">
								<v-sheet color="green" rounded="lg" class="segment px-1 py-2">{{ generated?.[uuid]?.salt && apiResponseData2 ? generated[uuid].salt : '\u003cempty>' }}</v-sheet>
								<v-chip style="position: absolute; top: -40%; right: 6px" text="NaCl" />
							</div>
							<div style="position: relative; min-width: 70px">
								<v-sheet color="green" rounded="lg" class="segment px-1 py-2 text-center">{{ generated?.[uuid]?.salt && apiResponseData2 ? apiResponseData2.slice(generated[uuid].salt.length) : apiResponseData2 || '\u003cempty>' }}</v-sheet>
								<v-chip style="position: absolute; top: -40%; right: 6px" text="Seed" />
							</div>
						</div>
						<v-row>
							<v-col v-for="({ name, url, responseData, userId, uuid }, index) of lookupApiCalls" :cols="xs ? 12 : 6" class="px-3" :style="`padding-${index % 2 !== 0 ? 'left' : 'right'}: 1px !important`">
								<div class="text-caption text-center mt-8">{{ name }}</div>
								<div style="font-size: 0.75rem" class="d-flex flex-wrap">
									<url-visualizer :url="url" height="200px" />
								</div>
								<div class="text-caption text-center mt-8">fetch response data</div>
								<v-sheet color="black" rounded="lg" class="my-2 pa-2" :height="lookupApiCalls[0].responseData || lookupApiCalls[1].responseData ? '500px' : '200px'" style="overflow-y: auto">
									<pre v-if="responseData" style="font-size: small; white-space: pre-wrap">{{ JSON.stringify(responseData, null, '  ') }}</pre>
									<div v-else class="text-overline d-flex flex-column justify-center align-center h-100">
										<div v-if="!fetchingFromGithub">no data</div>
										<div v-else class="text-center text-caption mb-4">
											Attemping to fetch from CDN...<br />
											<span style="font-size: 0.5rem">(keep in mind the initial fetch may take a few minutes)</span>
										</div>
										<v-btn :text="fetchingFromGithub !== undefined && index === 1 ? 'retry' : 'fetch'" size="small" color="blue-darken-4" @click="!fetchingFromGithub && fetchGithub(userId, uuid)" :disabled="fetchingFromGithub" :loading="fetchingFromGithub" />
										<div class="text-center text-caption mb-4" id="fetchingFromGithubStatus">
											{{ fetchingFromGithubStatus?.message || '' }}<br />
											<span style="font-size: 0.5rem" v-if="fetchingFromGithubStatus?.status">status: {{ fetchingFromGithubStatus.status }}<br />updated: {{ fetchingFromGithubStatus.updated.toLocaleString() }}</span>
										</div>
									</div>
								</v-sheet>
							</v-col>
						</v-row>
					</v-tabs-window-item>
				</v-tabs-window>
			</v-sheet>
		</v-form>

		<v-card flat tile class="mb-8 mx-n4 saira-extra-condensed-light py-16" color="blue-darken-2">
			<v-card-title class="title font-weight-bold text-wrap">What is a Deterministic Name Generator</v-card-title>
			<v-card-subtitle class="text-wrap">A deterministic name generator is a tool that generates a unique name based on a seed and a set of rules.</v-card-subtitle>
			<v-card-text>
				<p class="my-4">
					A Deterministic Name Generator (DNG) is a system that produces the same output name every time it receives the same input, ensuring consistency and predictability. This is achieved by using a <span class="font-weight-bold">SHA-256 cryptographic hash function</span>, which transforms the input into a
					fixed-length, collision-resistant hash. The hash is then processed into a structured, human-readable format using predefined dictionaries and entropy controls.
				</p>

				<p class="my-4">Unlike traditional random name generators, a DNG does not introduce unpredictability—<span class="font-weight-bold">the same input always results in the same output</span>, making it ideal for applications requiring stable, reusable identifiers.</p>

				<p class="mt-8 saira-extra-condensed-bold text-black" style="font-size: 1rem">Benefits of a Deterministic Name Generator:</p>
				<v-list bg-color="white" density="compact" rounded="lg">
					<v-list-item><span class="font-weight-bold">Consistency</span> – The same input always produces the same name.</v-list-item>
					<v-list-item><span class="font-weight-bold">Stateless</span> – No database storage is required; names are generated on demand.</v-list-item>
					<v-list-item><span class="font-weight-bold">Collision Resistance</span> – SHA-256 hashing minimizes the likelihood of duplicate names.</v-list-item>
					<v-list-item><span class="font-weight-bold">Cross-Platform Use</span> – The same logic can be applied across different systems.</v-list-item>
					<v-list-item><span class="font-weight-bold">Privacy-Preserving</span> – Inputs can be hashed before processing, ensuring data security.</v-list-item>
				</v-list>

				<p class="my-4">
					By leveraging <span class="font-weight-bold">SHA-256 hashing</span>, the system guarantees high entropy while maintaining a structured, human-readable output. Whether for <span class="font-weight-bold">usernames, gamertags, or unique identifiers</span>, a DNG provides an elegant and deterministic
					solution.
				</p>

				<p class="mt-8 saira-extra-condensed-bold text-black" style="font-size: 1rem">How aName Ensures Collision-Proof Names:</p>
				<v-list bg-color="white" density="compact" rounded="lg">
					<v-list-item><span class="font-weight-bold">Global Uniqueness Enforcement</span> – aName checks and registers each generated name before finalizing assignment.</v-list-item>
					<v-list-item><span class="font-weight-bold">Real-Time Deduplication</span> – Ensures that even highly similar inputs cannot accidentally generate the same name.</v-list-item>
					<v-list-item><span class="font-weight-bold">Cross-Service Consistency</span> – Names remain unique across multiple applications using aName.</v-list-item>
					<v-list-item><span class="font-weight-bold">Scalable Architecture</span> – Combines high-speed caching (Redis) and permanent encrypted public records (GitHub) for guaranteed uniqueness, transparency, and scalability.</v-list-item>
				</v-list>

				<p class="my-4">
					While SHA-256 provides a high level of collision resistance, <span class="font-weight-bold">aName eliminates the burden on developers</span> by handling the additional complexity required to guarantee collision-proof names. Instead of requiring teams to build and maintain their own
					<span class="font-weight-bold">lookup systems, uniqueness enforcement, and data synchronization</span>, aName automates these processes as part of its streamlined service.
				</p>

				<p class="my-4">
					Through a combination of <span class="font-weight-bold">real-time uniqueness verification</span> (via Redis-backed storage) and <span class="font-weight-bold">eventual consistency with GitHub-backed mapping records</span>, aName ensures that no two users ever receive the same name—even when working
					across different projects or instances.
				</p>

				<p class="my-4">With aName, developers gain <span class="font-weight-bold">not just deterministic, but truly unique, collision-proof names</span>, making it the ultimate solution for identity generation at scale.</p>
			</v-card-text>
		</v-card>

		<v-card flat tile class="mb-8 mx-n4 saira-extra-condensed-light py-16">
			<v-card-title class="title font-weight-bold text-wrap">Example Uses of a Deterministic Name Generator</v-card-title>
			<v-card-subtitle class="text-wrap">Generating Consistent Usernames from a Seeded API</v-card-subtitle>
			<v-card-text>
				<div class="text-caption text-center mt-8 font-weight-bold">Node.js (Express) and Keycloak Integration</div>
				<v-sheet color="black" rounded="lg" class="my-2 pa-2" height="500px" style="overflow-y: auto">
					<pre style="font-size: small; white-space: pre-wrap"><code v-html="hljs.highlightAuto(nodeExpressFetch).value"></code></pre>
				</v-sheet>
			</v-card-text>
		</v-card>

		<v-card flat tile class="mb-8 mx-n4 saira-extra-condensed-light" :class="xs ? '' : 'pa-16'" color="blue-darken-4">
			<v-card-title class="title font-weight-bold text-wrap">“What’s in a name?</v-card-title>
			<v-card-subtitle class="text-wrap mt-n4">That which we call a rose / By Any Other Name would smell as sweet.”</v-card-subtitle>
			<v-card-text>
				<p class="mb-4">Turns out there's a lot to a name... or more pointedly NAMING.</p>

				<p class="mb-4">
					Naming is a critical part of our lives, from the moment we're born to the moment we die. It's how we identify ourselves, how we're identified by others, and how we identify others. It's how we brand ourselves, how we brand our products, and how we brand our services. It's how we communicate, how we
					connect, and how we create. It's how we remember, how we remind, and how we recognize. It's how we differentiate, how we distinguish, and how we define. It's how we express, how we evoke, and how we engage. It's how we inspire, how we influence, and how we innovate. It's how we lead, how we learn,
					and how we love. It's how we motivate, how we manage, and how we measure. It's how we navigate, how we negotiate, and how we nurture. It's how we organize, how we optimize, and how we operate. It's how we plan, how we perform, and how we persevere. It's how we question, how we qualify, and how we
					quantify. It's how we remember, how we remind, and how we recognize. It's how we strategize, how we structure, and how we succeed. It's how we transform, how we transcend, and how we thrive. It's how we understand, how we unify, and how we uplift. It's how we validate, how we value, and how we
					visualize. It's how we win, how we wonder, and how we work. It's how we x-ray, how we yield, and how we yearn. It's how we zeal, how we zest, and how we zoom!
				</p>

				<p class="mb-4">So, what's in a name? Everything. And that's why we're here to help you manage them all, every last one of them.</p>
			</v-card-text>
		</v-card>

		<v-card rounded="xl" flat class="d-flex saira-extra-condensed-regular flex-column py-16">
			<v-card-title class="text-wrap saira-extra-condensed-bold px-0 text-center title">Choose Your Plan</v-card-title>
			<v-card-subtitle class="animate__animated animate__fadeIn animate__slower text-wrap px-0"></v-card-subtitle>
			<v-card-text class="text-start px-0">
				<plan-group :role="`${role}`" />
			</v-card-text>
		</v-card>

		<swal-html-card ref="swalHtmlRef" :swalActive="swalActive" :generated="generated" :uuid="uuid" :role="role" @close:swal="Swal.close" @close:andLookup="closeAndLookupHandler" />

		<add-dictionary-dialog v-model="dialogs.addDictionary" :selected="params.dictionaries" @update:modelValue="value => (dialogs.addDictionary = value)" @update:dictionary="dictionary => addDictionary(dictionary)" />
		<names-dialog v-model="dialogs.names" :names="stats.names" />
		<apikeys-dialog v-model="dialogs.apikeys" :apikeys="store.aname.apikeys" />
		<v-snackbar v-model="snackbar.active" multi-line :timeout="snackbar.timeout" @mouseenter="snackbar.timeout = -1" @mouseleave="snackbar.timeout = 5000">
			<div class="text-caption">{{ snackbar.text }}</div>
			<template v-slot:actions>
				<v-btn color="green" variant="text" @click="$keycloak.login" text="Sign in" />
				<v-btn variant="text" @click="snackbar.active = false" text="Close" />
			</template>
		</v-snackbar>
	</v-container>
</template>
<style>
.swal2-html-container {
	padding-left: 1rem;
	padding-right: 1rem;
}
html {
	font-size: 1.5rem;
}
.title {
	font-size: 2.2rem;
	line-height: 2.5rem !important;
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
	max-width: 75vw;
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
:deep(.dictionary .v-chip__content) {
	width: 100%;
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
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import Swal from 'sweetalert2'
import 'highlight.js/styles/github.css'
import 'animate.css'

import UrlVisualizer from '../components/UrlVisualizer.vue'
import AnameHeader from '../components/AnameHeader.vue'
import AddDictionaryDialog from '../components/aname/AddDictionaryDialog.vue'
import NamesDialog from '../components/aname/NamesDialog.vue'
import ApikeysDialog from '../components/aname/ApikeysDialog.vue'
import nodeExpressFetch from '@/data/codeExamples/nodeExpressFetch?raw'
import PlanGroup from '../components/aname/PlanGroup.vue'
import SwalHtmlCard from '../components/aname/SwalHtmlCard.vue'

hljs.registerLanguage('javascript', javascript)

const { xs, smAndDown } = useDisplay()
const { $keycloak } = getCurrentInstance().appContext.config.globalProperties
const swalHtmlRef = ref()
const tabs = ref()
const clipboard = inject('clipboard')
const {
    MODE,
    VITE_APP_API_SERVER_ANAME: VITE_APP_API_SERVER
} = import.meta.env
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
	apikeys: false,
})
const userId = ref('anonymous')
const dictionaryValidationProgressRef = ref([])
const store = useAppStore()
const generated = computed(() => uuid.value && store.aname.generated[userId.value])
const lookup = computed(() => store.aname.lookups[userId.value])
const canGenerate = computed(() => (uuid.value && !generated.value?.[uuid.value] ? true : false))
const didLookup = computed(() => uuid.value && lookup.value && !!lookup.value[uuid.value])
const snackbar = ref({
	active: false,
	text: '',
})
const keyHint = computed(() => {
	return params.value.publicKey && store.aname.keypair.pub && params.value.publicKey !== store.aname.keypair.pub ? 'NOTE: This key does not match the stored keypair.' : undefined
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
        v => (v && v.length > 0) || 'At least one dictionary is required',
        v => (v && v.length > 0 && v.length <= 5) || 'A maximum of 5 dictionaries is supported.'
    ],
	separator: [
        v => !!v || 'Separator is required',
        v => !!v || (v && v.length == 1) || 'Separator must be exactly 1 character',
        v => (v && /^[-_:.|,;+# ]$/.test(v)) || 'Separator must be one of the following: - _ : . | , ; + # space'
    ],
	suffixLength: [
        v => v !== undefined || 'Suffix Length is required',
        v => (v !== undefined && Number(v) >= 0 && Number(v) <= 21) || 'Suffix Length must be a positive number between 0 and 21 inclusive'
    ],
	publicKey: [
        v => !!v || 'Public key is required',
        v => v.length === 64 || 'Public key must be 32 bytes (Hex: 64 chars)'
    ],
})
const styleObjs = computed(() => ({
	generatedBtn: !canGenerate.value
		? {
				position: 'absolute',
				bottom: '0',
				right: '6px',
		  }
		: {},
	didLookupBtn: didLookup.value
		? {
				position: 'absolute',
				bottom: '0',
				right: '6px',
		  }
		: {},
	copyNameBtn: {
		position: 'absolute',
		top: '6px',
		right: '6px',
	},
}))
const defaultParams = ref({
	separator: '_',
	suffixLength: '0',
})
const params = ref({
	entropyMode: store.aname.entropyMode,
	dictionaries: ['https://github.june07.com/dictionary/adjs.txt', store.aname.availableDictionaries[0], 'https://github.june07.com/dictionary/name-thesaurus.txt'],
	template: `${encodeURIComponent('https://github.june07.com/dictionary/adjs.txt')}-colors-${encodeURIComponent('https://github.june07.com/dictionary/name-thesaurus.txt')}`,
	separator: store.aname.separator,
	suffixLength: store.aname.suffixLength,
	seed: generated.value?.length ? '' : store.aname.seed,
	publicKey: store.aname.publicKey,
	nocache: MODE === 'production' ? false : true,
})
const role = computed(() => ($keycloak.value?.isAuthenticated && $keycloak.value.resourceAccess?.['ai'].roles.find(role => role.startsWith('aname'))) || '')
// prettier-ignore

const keyRef = ref()
const templateArr = computed(() => {
	const arr = params.value.dictionaries?.map(dictionary => ({
		name: typeof dictionary === 'object' ? Object.keys(dictionary)[0] : dictionary.split('/').pop(),
		href: typeof dictionary === 'object' ? undefined : dictionary,
	}))
	params.value.template = arr.map(d => btoa(d.href || d.name)).join(params.value.separator)

	return arr
})
const swalActive = ref(false)
const apiResponseData = computed(() => uuid.value && generated.value && generated.value[uuid.value]?.data)
const apiResponseData2 = computed(() => uuid.value && lookup.value && lookup.value[uuid.value])
const url2 = computed(() => `${VITE_APP_API_SERVER}/v1/aname/${apiResponseData.value?.name || 'unique-name-placeholder'}?publicKey=${params.value.publicKey || ''}`)
const url3 = computed(() => `https://router-aname.june07.com/n/${apiResponseData.value?.templateHash}/${apiResponseData.value?.name || 'unique-name-placeholder'}.json`)
const lookupApiCalls = computed(() => [
	{
		name: 'aName API',
		url: url2.value,
		responseData: apiResponseData2.value,
	},
	{
		name: 'GitHub CDN',
		url: url3.value,
		responseData: uuid.value && userId.value && store.aname.lookupsGithub[userId.value]?.[uuid.value],
		userId: userId.value,
		uuid: uuid.value,
	},
])
function updateURL() {
	const urlBase = new URL(`${VITE_APP_API_SERVER}/v1/aname`)

	Object.keys(params.value || {}).forEach(key => {
		let value

		if (key === 'dictionaries') {
			value = JSON.stringify(params.value[key])
		} else if (key === 'seed') {
			value = `${store.aname.salt || ''}${params.value[key] || ''}`
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
	const { token } = await $keycloak.value

	if (action !== 'lookup') {
		fetch(url.value, {
			headers: token
				? {
						Authorization: `Bearer ${token}`,
				  }
				: {},
		})
			.then(response => response.json())
			.then(async data => {
				if (data.error) {
					snackbar.value.text = data.error
					snackbar.value.active = true
					return
				}
				if (!generated.value) {
					store.aname.generated[userId.value] = {}
				}
				if (!generated.value[uuid.value]) {
					if (!Object.keys(generated.value).length) {
						swal()
					}
					store.aname.generated[userId.value][uuid.value] = {
						url: url.value,
						salt: store.aname.salt,
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

				if (!lookup.value) {
					store.aname.lookups[userId.value] = {}
				}
				if (response.ok) {
					if (data && !lookup.value[uuid.value]) {
						store.aname.lookups[userId.value][uuid.value] = data
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
		fetchGithub(userId.value, uuid.value)
	}
}
const fetchingFromGithub = ref()
const fetchingFromGithubStatus = ref({})
async function fetchGithub(userId, uuid) {
	const fetchingFromGithubStatusEl = document.getElementById('fetchingFromGithubStatus')

	function animationEndEvent() {
		fetchingFromGithubStatusEl.classList.remove('animate__animated', 'animate__rubberBand')
		fetchingFromGithubStatusEl.removeEventListener('animationend', animationEndEvent)
	}
	if (fetchingFromGithub.value) return
	fetchingFromGithub.value = true
	for (let attempt = 0; attempt < 11; attempt++) {
		await fetch(url3.value)
			.then(async response => {
				if (response.ok) {
					store.aname.lookupsGithub[userId][uuid] = await response.json()
					return
				}
				fetchingFromGithubStatus.value = { status: response.status, updated: new Date() }
			})
			.catch(error => {
				fetchingFromGithubStatus.value = { message: error.message }
			})
			.finally(() => {
				fetchingFromGithubStatusEl.addEventListener('animationend', animationEndEvent)
				fetchingFromGithubStatusEl.classList.remove('animate__animated', 'animate__rubberBand')
				nextTick(() => fetchingFromGithubStatusEl.classList.add('animate__animated', 'animate__rubberBand'))
			})
		await new Promise(resolve => setTimeout(resolve, 11000 * attempt))
	}
	fetchingFromGithub.value = false
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
						console.error('Invalid format: Contains invalid characters or incorrect spacing ', str)
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
			const [name, value] = Object.entries(localDictionary)[0]
			const words = value.length

			store.aname.metadata[name] = {
				words,
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
	name: false,
})
function copyHandler(str, tooltipName) {
	clipboard.copy(str).then(copied => {
		tooltips.value[tooltipName] = copied
		if (copied) {
			setTimeout(() => (tooltips.value[tooltipName] = false), 1500)
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
	const name = typeof dictionary === 'string' ? dictionary : Object.keys(dictionary)[0]

	// console.log('dictionaryAsName: ', name)

	return name
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
		padding: xs.value ? 0 : undefined,
		showConfirmButton: false,
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

	userId.value = $keycloak.value.tokenParsed.sub
	username.value = $keycloak.value.tokenParsed.anameUsername || $keycloak.value.tokenParsed.preferred_username
	const { token } = await $keycloak.value

	// get count stats
	fetch(token && `${VITE_APP_API_SERVER}/v1/aname/stats`, {
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

	if (token && !store.aname.apikeys.length) {
		fetch(`${VITE_APP_API_SERVER}/v1/aname/apikey`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(response => response.json())
			.then(data => {
				store.aname.apikeys = [data.apikey]
			})
			.catch(error => {
				console.error('Error fetching metadata:', error)
			})
	}
}
const dictionaryChangeMenu = ref([])
function dictionaryChangeHandler(newDictionary, oldDictionary) {
	dictionaryChangeMenu.value[oldDictionary.index] = true
	params.value.dictionaries.splice(oldDictionary.index, 1, newDictionary)

	// Close the menu manually
	nextTick(() => {
		dictionaryChangeMenu.value[oldDictionary.index] = false
	})
}
function closeAndLookupHandler() {
	const tab = document.querySelector('#lookupTab')
	let btn

	function animationendEvent() {
		btn.removeEventListener('animationend', animationendEvent)
		btn.classList.remove('animate__animated', 'animate__bounceIn')
	}
	Swal.close()
	setTimeout(() => {
		window.scrollTo({
			behavior: 'smooth',
			top: tab.getBoundingClientRect().top - document.body.getBoundingClientRect().top - 200,
		})
		tab.click()
		setTimeout(() => {
			btn = document.querySelector('#lookupBtn')
			btn.addEventListener('animationend', animationendEvent)
			btn.classList.add('animate__animated', 'animate__bounceIn')
		}, 1500)
	}, 500)
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
