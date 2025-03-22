<template>
	<v-dialog :model-value="modelValue" width="600" @update:modelValue="$emit('update:modelValue', $event)" style="opacity: 0.95">
		<v-data-table :items="names" density="compact" />
	</v-dialog>
</template>
<script setup>
import { computed } from 'vue'
import 'animate.css'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
	names: Array,
	modelValue: Boolean,
})
const names = computed(() =>
	props.names.map(name => {
        const cols = {
            ...name,
            added: new Date(name.addedAt).toLocaleString(),
        }
        delete cols.addedAt
        return cols
    })
)
</script>
