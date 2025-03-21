<template>
	<div>
		<v-app-bar color="primary" height="50">
			<v-app-bar-nav-icon variant="tonal" size="x-small" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

			<v-toolbar-title class="saira-extra-condensed-light text-body-1">aName - unique deterministic names</v-toolbar-title>

			<v-spacer></v-spacer>

			<template v-if="!xs">
				<v-menu>
					<template v-slot:activator="{ props, isActive }">
						<v-btn variant="tonal" v-bind="props" :append-icon="isActive ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" size="small">
							<span class="text-caption">info</span>
							<template v-slot:prepend>
								<v-icon icon="info" size="small"></v-icon>
							</template>
						</v-btn>
					</template>
					<v-list>
						<v-list-item v-for="(item, index) in items.info" :key="index" :value="index" :href="item.href" density="compact">
							<template v-slot:prepend>
								<v-icon :icon="item.icon" size="x-small" />
							</template>
							<v-list-item-title class="saira-extra-condensed-light text-body-2">{{ item.title }}</v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu>
			</template>
		</v-app-bar>

		<v-navigation-drawer v-model="drawer" temporary>
			<v-list>
				<v-list-item v-for="(item, index) in items.main" :key="index" :value="index" :href="item.href" @click="item.action" density="compact">
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
:deep(.v-list-.v-icon) {
	font-size: 0.75rem !important;
}
</style>
<script setup>
import { ref, getCurrentInstance, computed } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'

const { xs } = useDisplay()
const { $keycloak } = getCurrentInstance().appContext.config.globalProperties
const { login, logout } = $keycloak.value
const drawer = ref(false)
const items = computed(() => ({
	main: [
		{
			title: $keycloak.value.isAuthenticated ? 'sign out' : 'sign in',
			action: $keycloak.value.isAuthenticated ? logout : login,
			icon: $keycloak.value.isAuthenticated ? 'logout' : 'login',
		},
		{
			title: 'support',
			href: 'https://github.com/june07/aname/issues',
			icon: 'help',
		},
	],
	info: [
		{
			title: 'about aName',
			href: 'https://blog.june07.com/2022/06/02/what-is-aname/',
			icon: 'rss_feed',
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
