<template>
	<div>
		<v-app-bar color="primary" height="50">
			<v-img src="/public/aname/icon/icon128@3x.png" height="64" max-width="64" class="ml-2" />
			<v-toolbar-title>
				<div class="d-flex align-center text-no-wrap">
					<div class="mt-1 boldonse-regular">aName</div>
					<div v-if="!xs" class="text-h5 saira-extra-condensed-light ml-4">Unique Deterministic Names</div>
				</div>
			</v-toolbar-title>

			<div v-for="menu of menus" class="d-flex align-center mr-2">
				<v-menu v-if="!xs && menu.name === 'info'">
					<template v-slot:activator="{ props, isActive }">
						<v-btn variant="tonal" v-bind="props" :append-icon="isActive ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" size="small">
							<span class="text-caption">{{ menu.name }}</span>
							<template v-slot:prepend>
								<v-icon :icon="menu.icon" size="small" />
							</template>
						</v-btn>
					</template>
					<v-list>
						<v-list-item v-for="(item, index) in items[menu.name]" :key="index" :value="index" :href="item.href" rel="noopener noreferrer" target="_blank" density="compact">
							<template v-slot:prepend>
								<v-img v-if="item.img" :src="item.img" width="24" height="24" class="mr-8" />
								<v-icon v-else :icon="item.icon" size="x-small" />
							</template>
							<v-list-item-title class="saira-extra-condensed-light text-body-2">{{ item.title }}</v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu>
				<v-chip v-else-if="menu.name === 'user' && username" label rounded class="pl-0 rounded-ts-xl rounded-bs-xl rounded-e-xl">
					<v-avatar class="text-caption font-weight-bold text-capitalize" color="white" size="small" :text="username?.slice(0, 2)" />
				</v-chip>
			</div>
			<v-app-bar-nav-icon variant="plain" size="x-small" @click.stop="drawer = !drawer" />
		</v-app-bar>

		<v-navigation-drawer v-model="drawer" temporary location="right">
			<v-list>
				<v-list-item v-for="(item, index) in items.side.filter(i => !i.filter)" :key="index" :value="index" :href="item.href" @click="() => item.action($emit)" density="compact">
					<template v-slot:append>
						<v-icon :icon="item.icon" size="x-small" />
					</template>
					<v-list-item-title class="saira-extra-condensed-light text-body-2 text-end">{{ item.title }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
	</div>
</template>
<style scoped>
.boldonse-regular {
	font-family: 'Boldonse', system-ui;
	font-weight: 400;
	font-style: normal;
}
:deep(.v-list-.v-icon) {
	font-size: 0.75rem !important;
}
</style>
<script setup>
import { ref, getCurrentInstance, computed } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'

defineEmits(['open:names', 'open:apikeys'])
const props = defineProps({
	username: String,
})
const { xs } = useDisplay()
const { $keycloak } = getCurrentInstance().appContext.config.globalProperties
const { login, logout } = $keycloak.value
const drawer = ref(false)
const menus = ref([
	{
		name: 'user',
		icon: 'user',
	},
	{
		name: 'info',
		icon: 'info',
	},
])
const items = computed(() => ({
	side: [
		{
			title: $keycloak.value.isAuthenticated ? 'sign out' : 'sign in',
			action: $keycloak.value.isAuthenticated ? logout : login,
			icon: $keycloak.value.isAuthenticated ? 'logout' : 'login',
		},
		{
			title: 'api keys',
			action: $emit => $emit('open:apikeys'),
			icon: 'key',
			filter: !$keycloak.value.isAuthenticated,
		},
		{
			title: 'names',
			action: $emit => $emit('open:names'),
			icon: 'more',
			filter: !$keycloak.value.isAuthenticated,
		},
	],
	info: [
		{
			title: 'about aName',
			href: 'https://blog.june07.com/kind-pink-meal/',
			icon: 'rss_feed',
		},
		{
			title: 'GitHub',
			href: 'https://github.com/june07/aname',
			img: '/github-mark.svg',
		},
        {
			title: 'name repos',
			href: 'https://github.com/june07-aname',
			img: '/github-mark.svg',
		},
		{
			title: 'support',
			href: 'https://github.com/june07/aname/issues',
			icon: 'help',
		},
	],
	account: [
		{
			title: $keycloak.value.isAuthenticated ? 'sign out' : 'sign in',
			action: $keycloak.value.isAuthenticated ? logout : login,
			icon: 'rss_feed',
		},
		{
			title: 'support',
			href: 'https://github.com/june07/aname/issues',
			icon: 'help',
		},
	],
}))
</script>
