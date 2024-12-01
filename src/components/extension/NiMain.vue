<template>
    <v-container>
        <v-row>
            <v-col class="d-flex align-center mt-n6 py-0">
                <div>
                    <v-img width="196" height="196" :src="iconNiM" alt="NIM icon"></v-img>
                </div>
                <div style="font-size: 36px" class="font-weight-light animate__animated animate__lightSpeedInRight">
                    <span class="font-weight-medium">N</span>ode
                    <span class="font-weight-medium">I</span>nspector <span class="font-weight-medium">M</span>anager
                </div>
                <v-tooltip text="Besides Node.js, NIM works with other JavaScript V8 engines including Deno, Chromium browsers, and more." aria-label="Besides Node.js, NIM works with other JavaScript V8 engines including Deno, Chromium browsers, and more." location="top">
                    <template v-slot:activator="{ props }">
                        <v-icon style="cursor: pointer" v-bind="props" icon="info" color="green" size="20px" class="mx-2 mb-4" id="v8-info-i" />
                    </template>
                </v-tooltip>
            </v-col>
        </v-row>
        <v-tabs v-model="tab" grow class="mt-8" color="green-darken-1">
            <v-tab v-for="tab of tabs" :key="tab.id" :value="tab.id" class="text-uppercase px-0" :id="`tab-${tab.id}`" :class="roundedClass(tab.id)">{{ tab.name }}</v-tab>
        </v-tabs>
        <v-window v-model="tab">
            <v-window-item value="home">
                <v-form ref="form" id="local-control-input">
                    <v-row>
                        <v-col cols="6" class="px-0">
                            <v-text-field name="host" variant="underlined" id="host" v-model="inputs.host" placeholder="localhost" />
                        </v-col>
                        <v-col cols="6" class="px-0">
                            <v-text-field name="port" variant="underlined" id="port" v-model="inputs.port" placeholder="9229" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex align-center justify-center pt-0">
                            <div class="ml-auto">
                                <v-tooltip :text="inputs.auto ? 'In auto mode, NiM will fully manage the lifecycle of the DevTools front-end.' : 'Manual mode lets you manage the DevTools front-end yourself.'" :aria-label="inputs.auto ? 'In auto mode, NiM will fully manage the lifecycle of the DevTools front-end.' : 'Manual mode lets you manage the DevTools front-end yourself.'" location="top">
                                    <template v-slot:activator="{ props }">
                                        <v-switch v-bind="props" id="auto" name="auto" hide-details v-model="inputs.auto" :color="inputs.auto ? 'green' : ''">
                                            <template v-slot:label>
                                                <div class="text-no-wrap" style="width: 50px">{{ inputs.auto ? 'Auto' : 'Manual' }}</div>
                                            </template>
                                        </v-switch>
                                    </template>
                                </v-tooltip>
                            </div>
                            <v-btn name="auto" class="mx-4 text-body-1" :color="inputs.auto ? '' : 'green'" :disabled="inputs.auto">Open DevTools</v-btn>
                            <div class="mr-auto ml-2">
                                <v-tooltip location="top" aria-label="When using --inspect-brk, NiM will automatically resume stepping to the first debugger statement.">
                                    <template v-slot:activator="{ props }">
                                        <v-switch v-bind="props" name="autoResumeInspectBrk" hide-details v-model="inputs.autoResumeInspectBrk" :color="inputs.autoResumeInspectBrk ? 'green' : ''" id="autoResumeSwitch" class="text-no-wrap">
                                            <template v-slot:label>
                                                <div class="text-no-wrap">Auto Resume Stepping</div>
                                            </template>
                                        </v-switch>
                                    </template>
                                    When using --inspect-brk, NiM will automatically resume stepping to the first debugger statement.<br>
                                    <a href="https://github.com/nodejs/node/issues/30911" target="_blank" rel="noopener">https://github.com/nodejs/node/issues/30911</a>
                                </v-tooltip>
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </v-window-item>

            <v-window-item value="localhost">
                <div class="row no-connections-detected pt-16" v-if="!Object.values(sessions).length">
                    <h1 ref="ml11" class="ml11">
                        <span class="text-wrapper">
                            <span class="line line1"></span>
                            <span class="letters">| no_detected_local_connections</span>
                        </span>
                    </h1>
                </div>
                <v-container v-else>
                    <v-row v-for="(session, id) in sessions" :key="id" class="d-flex align-center">
                        <v-col class="d-flex align-center py-0">
                            <div class="mr-2">
                                <v-img width="16" height="16" :src="session?.info?.type === 'deno' ? iconDeno : iconNode" />
                            </div>
                            <v-tooltip :close-delay="tooltips[`${id}`]" location="top" :aria-label="tooltips[`${id}`]">
                                <template v-slot:activator="{ props }">
                                    <div v-bind="props" @dblclick="tooltips[`${id}`] = 60000" class="text-no-wrap">
                                        <span class="mr-auto">{{ session?.info?.title }}</span>
                                        <span class="ml-2">({{ session.info?.infoURL?.match(/https?:\/\/([^:]*:[0-9]+)/)?.[1] }})</span>
                                        <span class="ml-2">{{ id }}</span>
                                    </div>
                                </template>
                                <v-container v-click-outside="() => tooltips[`${id}`] = 0">
                                    <v-row>
                                        <v-col class="pa-0 font-weight-bold" cols="2">source</v-col>
                                        <v-col class="pa-0">{{ session.info?.infoURL }}</v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col class="pa-0 font-weight-bold" cols="2">debugger url</v-col>
                                        <v-col class="pa-0">{{ session.url }}</v-col>
                                    </v-row>
                                </v-container>
                            </v-tooltip>
                        </v-col>
                        <v-spacer></v-spacer>
                        <v-col cols="5" class="d-flex align-center py-0">
                            <v-switch small hide-details color="green" :id="`auto-localhost-${id}`" inset v-model="inputs.session.auto[`${id}`]" density="compact" class="ml-auto shrink small-switch" @click="inputs.session.auto[`${id}`] = !inputs.session.auto[`${id}`]">
                                <template v-slot:label>
                                    <div class="text-no-wrap" style="width: 50px">{{ inputs.session.auto[`${id}`] ? 'Auto' : 'Manual' }}</div>
                                </template>
                            </v-switch>
                            <v-btn size="small" :id="`devtools-localhost-${id}`" color="green" class="mx-1 text-uppercase font-weight-bold">devtools</v-btn>
                            <v-btn size="small" :id="`remove-localhost-${id}`" color="red" class="mx-1 text-uppercase font-weight-bold">remove</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-window-item>
        </v-window>
    </v-container>
</template>
<style scoped>
.v-tab--selected {
    font-size: x-large;
}

:deep() input#host,
:deep() input#port,
:deep() .v-input__details {
    text-align: center;
}

:deep() .v-overlay__content {
    pointer-events: all !important;
    background-color: white !important;
    border: 1px solid green;
    border-radius: 10px !important;
    color: black !important;
    opacity: 0.9;
}
</style>
<script setup>
import { ref, computed } from 'vue'
import iconNiM from "/icon128@3x.webp"
import iconDeno from "/deno-favicon.ico"
import iconNode from "/node-favicon.ico"

const tab = ref()
const tabs = ref([
    { name: "home", id: "home" },
    { name: "localhost", id: "localhost" },
])
const inputs = ref({
    host: "localhost",
    port: "9229",
    auto: true,
    autoResumeInspectBrk: false,
    session: {
        auto: {
            "1507761075": true
        },
    }
})
const sessions = {
    "1507761075": {
        "url": "devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=localhost:9229/d1bf019a-533e-4496-ac93-78bc655ce0cd",
        "auto": true,
        "autoClose": false,
        "newWindow": false,
        "tabId": 1507761075,
        "info": {
            "infoURL": "http://localhost:9229/json",
            "description": "node.js instance",
            "devtoolsFrontendUrl": "devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=localhost:9229/d1bf019a-533e-4496-ac93-78bc655ce0cd",
            "devtoolsFrontendUrlCompat": "devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=localhost:9229/d1bf019a-533e-4496-ac93-78bc655ce0cd",
            "faviconUrl": "https://nodejs.org/static/images/favicons/favicon.ico",
            "id": "d1bf019a-533e-4496-ac93-78bc655ce0cd",
            "title": "hello.js",
            "type": "node",
            "url": "file://P:_code_hello.js",
            "webSocketDebuggerUrl": "ws://localhost:9229/d1bf019a-533e-4496-ac93-78bc655ce0cd"
        },
        "dtpSocket": {
            "messageIndex": 0,
            "socketUrl": "ws://localhost:9229/d1bf019a-533e-4496-ac93-78bc655ce0cd",
            "ws": {},
            "socket": "localhost:9229"
        },
        "socket": {
            "host": "localhost",
            "port": "9229"
        }
    }
}
const tooltips = computed(() => Object.keys(sessions).reduce((acc, sessionId) => {
    return sessionId ? { ...acc, [sessionId]: 0 } : acc
}, {}))
function roundedClass(tabId) {
    if (tabId === "home") return "rounded-te-lg"
    if (tabId === tabs.value[tabs.value.length - 1].id) return "rounded-ts-lg"
    return "rounded-t-lg"
}
</script>
