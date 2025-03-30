<template>
	<!-- does not work -->
	<draggable v-model="validDictionaries" @change="dictionaryOrderChanged" class="d-flex flex-column" item-key="name" handle=".handle" :key="validDictionaries.length">
		<template #item="{ element: item, index }">
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
		</template>
	</draggable>
	<!-- works -->

	<draggable v-model="validDictionaries" @change="dictionaryOrderChanged" class="d-flex flex-column" item-key="name" handle=".handle" :key="validDictionaries.length">
		<template #item="{ element: item, index }">
			<v-chip class="dictionary d-flex justify-space-between handle" style="max-width: 90vw" :key="item" closable draggable :data-name="dictionaryAsName(item)" :ripple="false" @click:close="closeDictionaryHandler(item)">
				<div class="text-truncate saira-extra-condensed-regular">{{ dictionaryAsName(item).replace(/https?:\/\//, '') }}</div>
				<template v-slot:prepend>
					<v-chip class="mr-2 ml-n2 font-weight-bold" size="x-small" :text="index + 1" />
				</template>
				<template v-slot:append>
					<v-chip class="font-weight-bold" label v-if="store.aname.metadata[dictionaryAsName(item)]?.words" size="x-small" :text="store.aname.metadata[dictionaryAsName(item)].words" />
				</template>
			</v-chip>
		</template>
	</draggable>
</template>
