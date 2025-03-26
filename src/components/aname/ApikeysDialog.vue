<template>
	<v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" style="opacity: 0.95" class="saira-extra-condensed-regular">
		<v-data-table :headers="headers" :items="apikeys" density="compact" hide-default-footer>
			<template v-slot:item.key="{ item }">
				<v-text-field v-model="item.key" variant="solo" readonly hide-details flat>
					<template v-slot:append-inner>
						<v-tooltip text="Copied Api Key" v-model="tooltips.default" location="top" :open-on-hover="false">
							<template v-slot:activator="{ props: tooltip }">
								<v-btn v-bind="tooltip" @click.stop="copyHandler(tooltips, 'default', item.key)" text="copy" size="x-small" flat color="primary" />
							</template>
						</v-tooltip>
					</template>
				</v-text-field>
			</template>
		</v-data-table>
	</v-dialog>
</template>
<style scoped>
:deep(.v-text-field .v-field__input) {
	font-size: 1rem;
}
</style>
<script setup>
import { ref, computed, inject } from 'vue'
import 'animate.css'

defineEmits(['update:modelValue'])
const props = defineProps({
	apikeys: Array,
	modelValue: Boolean,
})
const tooltips = ref({
	default: false,
})
const copyHandler = inject('copyHandler')
const headers = [
	{ title: 'Api Key', value: 'key', width: '50%', align: 'end' },
	{ title: 'Created', value: 'created' },
	{ title: 'Expires', value: 'expires' },
]
const apikeys = computed(() =>
	props.apikeys?.map(key => {
		const cols = Object.fromEntries(
			Object.entries({
				...key,
				created: new Date(key.createdAt).toLocaleString(),
				expires: new Date(key.expiresAt).toLocaleString(),
				createdAt: undefined,
				expiresAt: undefined,
				role: undefined,
			}).filter(([k, v]) => v !== undefined)
		)

		return cols
	})
)
</script>
