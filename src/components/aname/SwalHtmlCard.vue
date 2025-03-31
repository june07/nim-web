<template>
	<v-card :style="{ zIndex: swalActive ? 1 : -1, height: swalActive ? 'auto' : '0px' }" rounded="xl" flat class="d-flex saira-extra-condensed-regular flex-column">
		<v-card-title class="text-wrap saira-extra-condensed-bold px-0" style="font-size: 1rem">{{ generated?.[uuid]?.data?.name || 'fake-transparent-name-placeholder' }}</v-card-title>
		<v-card-subtitle class="animate__animated animate__fadeIn animate__slower text-wrap px-0">Congratulations on your first generated name!</v-card-subtitle>
		<v-card-text class="text-start px-0">
			<p class="mb-4">Your <span class="font-weight-bold">unique</span> name has been <span class="font-weight-bold">deterministically</span> generated!🔥</p>
			<p class="mb-4">
				This means that as long as you provide the same input, you'll always get the same name—no pseudo-randomness games, no duplicates, no hassle!✨ Keep your real IDs private and opt for customized names instead with zero managment effort. Say goodbye to the hassle and extra processing required to
				track/store/manage name data.
			</p>
			<p class="mb-4">Perfect for <span class="font-weight-bold">cross-platform identity, gamertags, branding, you NAME it.</span>🔗</p>

			<p class="mb-4">
				And remember the power in aName, and really the reason it was built, is in it's ability to plug into your existing systems! So please visit the <a href="https://github.com/june07/aname" target="_blank" rel="noreferrer noopener">repo</a>,
				<a href="https://github.com/june07/aname/fork" target="_blank" rel="noreferrer noopener">fork</a>, and contribute!
			</p>

			<p class="mb-4">You can self-host aName or use the cloud version maintained by the developer.⤵️</p>

			<p>Create a <b>free</b> account to keep your name and unlock more features like <span class="font-weight-bold">additional API calls, shorter names, and more</span>!🗝️</p>

			<div class="mb-16 ml-4 text-caption font-italic font-weight-thin">(NOTE: The username you just generated is ephemeral. When you create an account, generated names are permanent)</div>

			<plan-group :role="`${role}`" />
		</v-card-text>
		<v-card-actions>
			<v-btn v-if="swalActive" class="mx-auto" rounded="lg" variant="tonal" color="blue-darken-4" text="close" @click="$emit('close:swal')" />
		</v-card-actions>

		<v-card-text class="text-start px-0">
			<p class="mb-4">
				Now would also be a good time to do a lookup on the name you just generated. You can do this by clicking the "lookup" button below.
				<v-btn text="lookup" size="small" color="blue" class="ml-2" @click="$emit('close:andLookup')" />
			</p>
			<p class="mb-4">Lookups demonstrate the API calls you can make with aName along with public calls to fetch the encrypted static name data from CDN repo.</p>
		</v-card-text>
	</v-card>
</template>
<script setup>
import PlanGroup from '@/components/aname/PlanGroup.vue'

defineEmits(['close:swal', 'close:andLookup'])
defineProps({
	swalActive: Boolean,
	generated: Object,
	uuid: String,
	role: String,
})
</script>
