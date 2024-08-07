<template>
    <v-app :theme="theme">
        <v-app-bar density="compact" flat>
            <v-spacer></v-spacer>
            <span id="nim-version" class="mx-8 text-body-2 font-weight-thin">v{{ version }}</span>
            <v-btn variant="plain" icon size="x-small" id="theme" @click="theme === 'light' ? theme = 'dark' : theme = 'light'">
                <span class="material-icons small-icon">{{ theme === 'light' ? 'light_mode' : 'dark_mode' }}</span>
            </v-btn>
            <v-btn variant="plain" icon density="compact" class="mr-6" id="settings-btn">
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
            <v-tooltip no-click-animation location="top">
                <v-card style="opacity: 0.8;" rounded="lg" color="black">
                    <v-card-title class="mb-0">Thank you for your support!</v-card-title>
                    <v-card-subtitle class="mt-n2 mb-4">
                        You can donate to NiM by using the donate button from the extension popup.
                    </v-card-subtitle>
                    <div class="text-end mr-4">In the meantime, please share NiM with your network.</div>
                    <div class="text-h5 text-center" style="margin-left: 250px;">👇</div>
                </v-card>
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" id="donate-btn" variant="flat" class="mx-2 text-white rounded-xl" color="green-lighten-2">
                        <span class="material-icons mr-2">toll</span>donate
                    </v-btn>
                </template>
            </v-tooltip>

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
import { ref, onMounted } from 'vue'

import NiMain from '@/components/extension/NiMain.vue'
import ShareMenu from './ShareMenu.vue'

const theme = ref('light')
const version = ref()

async function asyncInit() {
    const response = await fetch(`https://api.github.com/repos/june07/NiMv3/releases`)
    const releases = await response.json()
    version.value = releases.sort((a, b) => new Date(b.published_at) > new Date(a.published_at) ? -1 : 0).pop().tag_name.replace(/^v/i, '')
}
onMounted(() => {
    asyncInit()
})
</script>
