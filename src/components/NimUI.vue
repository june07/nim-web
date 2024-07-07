<template>
    <v-app :theme="theme" >
        <v-app-bar density="compact" flat>
            <v-spacer></v-spacer>
            <span id="nim-version" class="mx-8 text-body-2 font-weight-thin">v{{ version }}</span>
            <v-btn variant="plain" icon size="x-small" id="theme" @click="theme === 'light' ? theme = 'dark' : theme = 'light'">
                <span class="material-icons small-icon">{{ theme === 'light' ? 'light_mode' : 'dark_mode' }}</span>
            </v-btn>
            <v-btn variant="plain" icon density="compact">
                <span class="material-icons">login</span>
            </v-btn>
            <v-btn variant="plain" icon density="compact" @click="routeHandler(route?.path === 'settings' ? 'main' : 'settings')" class="mr-6" id="settings-btn">
                <span class="material-icons">settings</span>
            </v-btn>
        </v-app-bar>
        <v-main>
            <suspense>
                <ni-main />
            </suspense>
        </v-main>
        <v-footer :color="theme === 'light' ? 'grey-lighten-4' : undefined" app class="pa-4 d-flex align-center">
            <a id="site-href" target="_blank" rel="noopener" style="text-decoration: none" href="https://june07.com">
                <div class="text-h6 text-green-darken-4 ml-2"><span style="font-family: sans-serif; font-size: smaller">©</span> 2016-2024 June07</div>
            </a>
            <v-spacer></v-spacer>
            <div class="text-body-1">
            </div>
            <v-spacer></v-spacer>
            <v-tooltip v-model="tooltips.donate" open-on-click no-click-animation location="top" activator="#donate-btn">
                <v-card style="opacity: 0.8;" rounded="lg" color="black">
                    <v-card-title class="mb-0">Thank you for your support!</v-card-title>
                    <v-card-subtitle class="mt-n2 mb-2">Please share NiM with your network.</v-card-subtitle>
                    <div class="text-h5 text-end">👇</div>
                </v-card>
            </v-tooltip>
            <v-btn id="donate-btn" variant="flat" class="mx-2 text-white rounded-xl" color="green-lighten-2" @click="tooltips.donate = true">
                <span class="material-icons mr-2">toll</span>donate
            </v-btn>
            <div class="mr-4">
                <ShareMenu color="blue">
                    <span class="material-icons mr-2">share</span>share
                </ShareMenu>
            </div>
        </v-footer>
    </v-app>
</template>
<style scoped>
:deep() .v-application__wrap {
    min-height: unset;
}

:deep() .v-overlay__content {
    background-color: transparent !important;
}
</style>
<script setup>
import 'animate.css'
import { computed, ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useAppStore } from '../store/app'

import NiMain from '@/components/extension/NiMain.vue'
import ShareMenu from './ShareMenu.vue'

const tooltips = ref({
    donate: false
})
const route = useRoute()
const router = useRouter()
const theme = ref('light')
const { smAndDown } = useDisplay()
const { $api } = getCurrentInstance().appContext.config.globalProperties
const { VITE_APP_API_SERVER } = import.meta.env
const store = useAppStore()
const version = computed(() => store.releaseInfo?.tag_name)

async function asyncInit() {
    if (!store.releaseInfo || store.releaseInfo.lastUpdated < Date.now() - 1000 * 60 * 60 * 24) {
        store.releaseInfo = await $api.releaseInfo()
    }
}
onMounted(() => {
    asyncInit()
})
</script>
