<template>
	<v-dialog :model-value="modelValue" width="600" @update:modelValue="$emit('update:modelValue', $event)" style="opacity: 0.9">
		<v-card>
			<v-card-title>Add a Dictionary</v-card-title>
			<v-card-subtitle></v-card-subtitle>
			<v-card-text class="text-caption font-weight-medium">
				Add a new dictionary to the list of available dictionaries.
				<v-form ref="form" lazy-validation>
					<v-text-field variant="solo" flat label="Dictionary URL" v-model="dictionary" :rules="rules.asString" hint="https://example.com/dictionary.txt" persistent-hint />
				</v-form>
				<p class="mt-4">Or select a dictionary from the available dictionaries below.</p>
				<v-select :items="availableDictionaries" label="Available Dictionaries" variant="solo" flat @update:modelValue="selectionHandler" multiple />
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="primary" variant="plain" @click="$emit('update:modelValue', false)">cancel</v-btn>
				<v-btn color="primary" variant="tonal" @click="add" :disabled="!form?.isValid">add</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/store/app'
import 'animate.css'

const emit = defineEmits(['update:modelValue', 'update:dictionary'])
const props = defineProps({
	selected: Array,
	modelValue: Boolean,
})
const store = useAppStore()
const form = ref()
const availableDictionaries = computed(() =>
	store.aname.availableDictionaries
		.filter(dict => typeof dict === 'string') // filter out local dictionaries for now
		.filter(dict => !props.selected.includes(typeof dict === 'string' ? dict : Object.keys(dict)[0]))
		.map(dict => ({
			title: typeof dict === 'string' ? dict : Object.keys(dict)[0],
			value: typeof dict === 'string' ? dict : Object.keys(dict)[0],
		}))
)
// prettier-ignore
const rules = ref({
    asString: [
        v => !!v || 'Dictionary URL is required',
        v => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(v) || 'Dictionary URL is invalid',
    ],
    asObject: [
        v => !!v || 'Dictionary is required',
        v => (v && v.href && v.name) || 'Dictionary is invalid',
    ]
})
const dictionary = ref()
function add() {
	if (!form.value.validate()) return

	emit('update:dictionary', dictionary.value)
}
const selectionHandlerTimeout = ref()
function selectionHandler(value) {
	if (selectionHandlerTimeout.value) clearTimeout(selectionHandlerTimeout.value)
	selectionHandlerTimeout.value = setTimeout(() => {
		value.forEach(dictionary => {
			if (/https?:\/\//.test(dictionary)) {
				emit('update:dictionary', dictionary)
				return
			}
			// show another dialog to possibly edit the custom dictionary for now it's just filtered above so it can't be selected
		})
	}, 1000)
}
</script>
