<template>
    <v-app>
        <v-app-bar flat location="bottom" :collapse="collapse" style="opacity: 0.95;" v-if="!smAndDown && !/\/aname/.test($route.path)">
            <template v-slot:prepend>
                <v-app-bar-nav-icon @click="collapse = !collapse" aria-label="app bar nav button"></v-app-bar-nav-icon>
            </template>

            <v-app-bar-title class="font-weight-light"></v-app-bar-title>
            <v-btn v-show="!collapse" v-for="link of links.general" :to="link.to" :href="link.href" variant="text" :target="link.target" :rel="link.rel" class="text-capitalize" :aria-label="link.name" :text="link.name" />
            <v-spacer></v-spacer>
            <v-btn v-show="!collapse" v-for="link of links.legal" :to="link.to" :href="link.href" variant="text" size="small" class="pa-0 text-caption" :aria-label="link.name" :text="link.name" />
            <div v-show="!collapse" class="mx-8 font-weight-light text-no-wrap"><span style="font-family: sans-serif">©</span> 2025 June07</div>
        </v-app-bar>
        <v-navigation-drawer v-if="!smAndDown" order="2" width="200" floating location="left">
            <div class="h-100 d-flex align-center">
                <a href="https://www.digitalocean.com/?refcode=fe4184318b19&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge"><img src="https://web-platforms.sfo2.digitaloceanspaces.com/WWW/Badge%202.svg" style="width: 200px; height: 65px" alt="DigitalOcean Referral Badge" /></a>
            </div>
        </v-navigation-drawer>
        <v-main>
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" @change-theme="store.theme = store.theme === 'light' ? 'dark' : 'light'" @error="" />
                </keep-alive>
            </router-view>
        </v-main>
        <v-navigation-drawer v-if="!smAndDown" order="2" width="200" floating location="right">
            <div class="h-100 d-flex align-center justify-center">
                <a href="https://www.digitalocean.com/?refcode=fe4184318b19&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge"><img src="https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg" style="width: 190px; height: 65px;" alt="DigitalOcean Referral Badge" /></a>
            </div>
        </v-navigation-drawer>
        <v-snackbar text :timeout="-1" v-model="snackbar.active" style="opacity: 0.9" @click="snackbarCloseHandler">
            <v-row>
                <v-col cols="1" class="d-flex align-center justify-center">
                    <v-icon :icon="snackbar.icon" :color="snackbar.iconColor" />
                </v-col>
                <v-col cols="10" class="d-flex align-center justify-center">
                    <span v-if="error">{{ snackbar.message }}</span>
                    <span v-else @click="reload" class="font-weight-light" v-bind:class="smAndDown ? 'caption' : ''" style="cursor: pointer">App update available.</span>
                </v-col>
                <v-col cols="1" class="d-flex align-center justify-center">
                    <v-btn variant="plain" :size="smAndDown ? 'x-small' : ''" @click="snackbarCloseHandler" :aria-label="link.name" text=" x " />
                </v-col>
            </v-row>
        </v-snackbar>
    </v-app>
</template>
<style scoped></style>
<script setup>
import { ref, getCurrentInstance, provide, inject } from "vue"
import { useDisplay } from 'vuetify/lib/framework.mjs'

const clipboard = inject('clipboard')
const { smAndDown } = useDisplay()
const { $api } = getCurrentInstance().appContext.config.globalProperties
const version = ref()
const snackbarDefault = {
    active: false,
    icon: 'info',
    message: undefined,
}
const collapse = ref(false)
const snackbar = ref({ ...snackbarDefault })
const lastBuild = ref()
const versionCheckIntervalId = ref()
const buildInfo = ref()
const links = {
    general: [
        { name: "Home", to: "/" },
        { name: "Aname", to: "/aname" },
        { name: "FAQ", to: "/faq" },
        { name: "Blog", href: "https://blog.june07.com/tag/nim" },
        { name: "GitHub", href: "https://github.com/june07", target: "_blank", rel: "noopener" },
        //{ name: "IHotD", to: "ihotd" }
    ],
    legal: [
        { name: "Privacy", href: "https://privacy.june07.com" },
        { name: "Terms", href: "https://terms.june07.com" },
    ],
}

const checkVersion = async () => {
    buildInfo.value = await $api.buildInfo()

    if (!buildInfo.value?.build_date) {
        return
    }
    version.value = buildInfo.value.commit_sha
    if (lastBuild.value && lastBuild.value?.build_date !== buildInfo.value.build_date) {
        snackbar.value.active = true
        // TODO: put some extra check here...
        resetLocalStorage.value = true
    } else {
        lastBuild.value = buildInfo.value
    }
}
function snackbarCloseHandler() {
    snackbar.value.active = false
    setTimeout(() => {
        snackbar.value = { ...snackbarDefault }
        if (error) {
            error.value = false
        }
    })
}
function reload() {
    const url = new URL(window.location.href)
    url.searchParams.set('cache', Date.now())
    window.location.href = url.toString()
}
checkVersion()
versionCheckIntervalId.value = setInterval(checkVersion, 60000)

async function copyHandler(tooltips, tooltipName, value) {
    try {
        const copied = await clipboard.copy(value)
        if (copied && !(copied instanceof Error)) {
            tooltips[tooltipName] = true
        }
    } finally {
        setTimeout(() => {
            tooltips[tooltipName] = false
        }, 1500)
    }
}

provide('copyHandler', copyHandler)
</script>
