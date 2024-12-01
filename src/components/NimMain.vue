<template>
    <v-container fluid class="py-0">
        <v-parallax :src="`/irvan-smith-5eBW5GomfhY-unsplash${smAndDown ? '.mobile' : ''}.webp`" height="100vh" min-height="2160px" alt="unsplash background image - irvan smith">
            <v-spacer style="height: 100px"></v-spacer>
            <v-sheet ref="ogRef" class="d-flex mb-16 mx-auto" flat width="800" rounded="lg" style="opacity: 0.9">
                <div class="d-flex flex-column flex-grow-1">
                    <div class="px-8 text-body-1 pt-8 font-weight-bold">Serving Node.js Tools UX Diabeetus Since 2016</div>
                    <div class="px-8 text-body-2 text-center font-italic font-weight-light">The OG <a href="https://www.youtube.com/watch?v=Xb_0awoShR8&t=524s" target="_blank" rel="noopener" class="font-weight-bold">"UX Sugar"</a> for DevTools</div>
                </div>
                <a href="https://www.youtube.com/watch?v=Xb_0awoShR8&t=524s" target="_blank" rel="noopener" class="d-flex my-4 mr-4">
                    <picture>
                        <source srcset="/node-summit-paul-irish-355x200.webp" media="(max-width: 355px)">
                        <img src="/node-summit-paul-irish-355x200.webp" height="200" width="355" fetchpriority="high" alt="Google's Paul Irish recommending Node Inspector Manager (NIM)" />
                    </picture>
                </a>
            </v-sheet>
            <NimUI class="nim-ui" />
            <v-container class="d-flex justify-center align-center">
                <div class="install-buttons" v-for="method of installMethods">
                    <v-btn variant="flat" color="green-darken-2" :href="method.href" :text="method.name" rounded="lg" class="px-4 mr-2" size="large" :aria-label="method.name">
                        <template v-slot:prepend>
                            <v-img :src="method.icon || method.svg" width="32" height="32" class="mx-1" :style="method?.inverted ? 'filter: invert()' : ''" alt="install button image" />
                        </template>
                    </v-btn>
                </div>
            </v-container>
            <v-spacer style="height: 400px"></v-spacer>
            <highlight-card subtitle="" height="600" class="h-card-1 mr-16 rounded-e-lg" titleClass="text-center anton-regular" :style2="{ background: 'linear-gradient(90deg, white, transparent 10%)' }">
                <template v-slot:title>
                    <div @mouseleave="randomlyReanimate">
                        <span class="text-red-darken-4 font-weight-bold text-uppercase anton-regular">Loved</span> by Developers
                        <div class="loved">
                            <div class="heart1 animate__animated animate__heartBeat">❤️</div>
                            <div class="heart2 animate__animated animate__heartBeat">❤️</div>
                            <div class="heart3 animate__animated animate__heartBeat">❤️</div>
                        </div>
                    </div>
                </template>
                <template v-slot:subtitle>
                    <div v-intersect="showHaterMessage" style="position: relative; height: 60px">Or <a href="https://june07.com/please-do-not-be-an-a55-hole/">hated</a> but <span class="font-weight-bold">strong</span> feelings are better than no feelings!
                        <div ref="haterRef" class="text-h5 text-red-darken-4 animate__animated" style="position: absolute; top: 24px; right: 50%; display: none">"Haters gonna hate."</div>
                    </div>
                </template>
                <!-- <iframe v-if="renderIframe" v-show="loaded.page" class="mt-n4" ref="asssRef" src="https://asss.june07.com/app/nim?hideShare=1" border="0" width="100%" height="450" @load="loaded.iframe = true" title = "June07 Asss project https://github.com/june07/asss" ></iframe > -->
                <div v-show="loaded.page" class="mt-n4" ref="asssRef"></div>
                <v-skeleton-loader v-show="!loaded.page" type="card" class="mt-n4" width="100%" height="450" />
            </highlight-card>
            <v-spacer style="height: 200px"></v-spacer>
        </v-parallax>

        <v-parallax :src="`/joan-gamell-XmZ4GDAp9G0-unsplash${smAndDown ? '.mobile' : ''}.webp`" height="50vh" min-height="1024px">
            <v-spacer style="height: 200px"></v-spacer>
            <highlight-card ref="h-card-features" height="500" textClass="py-0 h-50 d-flex flex-column justify-end" titleClass="text-center anton-regular" subtitle="Large and Small, from Startups to Industry Leaders" subtitleClass="text-center font-weight-light" color="black">
                <div class="d-flex justify-center flex-wrap">
                    <img v-for="company of companies.filter(c => c.logo)" :key="company.id" :src="company?.logo" class="mx-2 company-logo" :style="company?.inverted ? 'filter: invert()' : ''" :alt="`Node Inspector Manager (NIM) is used by ${company.name}`" />
                </div>
                <template v-slot:title> <span class="text-blue-darken-2 font-weight-bold text-uppercase anton-regular">TRUSTED</span> by Companies </template>
            </highlight-card>
            <v-spacer style="height: 200px"></v-spacer>
        </v-parallax>

        <v-parallax :src="`/tai-bui-QW89whdEClA-unsplash${smAndDown ? '.mobile' : ''}.webp`" height="2200">
            <v-spacer style="height: 200px"></v-spacer>
            <highlight-card ref="h-card-2" height="1600" class="ml-16 rounded-s-lg" opacity="0.9" subtitle="by Streamlining Development Workflows" subtitleClass="text-center font-weight-light" titleClass="text-center anton-regular" :style2="{ background: 'linear-gradient(90deg, transparent 10%, white)' }">
                <template v-slot:title>
                    <div @mouseleave="randomlyReanimate">
                        <span class="font-weight-bold anton-regular text-orange-darken-4">Igniting</span> Productivity
                        <div class="loved">
                            <div class="heart1 animate__animated animate__heartBeat">🔥</div>
                            <div class="heart2 animate__animated animate__heartBeat">🔥</div>
                            <div class="heart3 animate__animated animate__heartBeat">🔥</div>
                        </div>
                    </div>
                </template>
                <!-- feature 1 -->
                <v-card color="green-lighten-4 px-8 pb-8 ma-16" class="rounded-xl">
                    <v-card-text class="d-flex justify-center align-center font-weight-bold text-capitalize"><v-chip text="feature 🔥" class="mr-2 font-weight-bold" /> plugable DevTools</v-card-text>
                    <v-img class="mx-auto opaque-image" height="600px" width="800" src="/features-devtools-switching.png" style="border-radius: 10%" alt="DevTools switching feature" />
                </v-card>
                <!-- feature 2 -->
                <v-card color="green-lighten-5 px-8 pb-8 ma-16" class="rounded-xl">
                    <v-card-text class="d-flex justify-center align-center font-weight-bold text-capitalize"><v-chip text="feature 🔥" class="mr-2 font-weight-bold" /> Multi-session Debugging management</v-card-text>
                    <v-img class="mx-auto opaque-image" height="400px" width="800" src="/features-multisession.png" style="border-radius: 10%" alt="Multisession feature" />
                </v-card>
                <!-- feature 3 -->
            </highlight-card>
            <v-spacer style="height: 200px"></v-spacer>
        </v-parallax>

        <v-parallax :src="`/joan-gamell-XmZ4GDAp9G0-unsplash${smAndDown ? '.mobile' : ''}.webp`" height="100vh">
            <v-spacer style="height: 400px"></v-spacer>
            <highlight-card ref="h-card-2" height="300" title="Install Now for Free" subtitle="If you're a solo developer/student/or just don't have the budget for tools, you can still use NiM unrestricted." subtitleClass="text-center font-weight-light" class="mr-16 rounded-e-lg" titleClass="text-center anton-regular" :style2="{ background: 'linear-gradient(90deg, white, transparent 10%)' }">
                <v-container class="d-flex flex-column justify-center align-center">
                    <div class="d-flex mb-8">
                        <div class="install-buttons" v-for="method of installMethods">
                            <v-btn variant="tonal" color="green-darken-2" :href="method.href" :text="method.name" rounded="lg" class="px-4 mr-2" :aria-label="method.name">
                                <template v-slot:prepend>
                                    <v-img :src="method.icon || method.svg" width="32" height="32" class="mx-1" :style="method?.inverted ? 'filter: invert()' : ''" alt="Install button image" />
                                </template>
                            </v-btn>
                        </div>
                    </div>
                    <div class="text-center text-caption">
                        <v-btn variant="text" class="ml-2 text-caption" text="subscription info" href="https://june07.com/nim-subscription/?noredirect=1" prepend-icon="info" aria-label="info" />
                        <div class="d-flex align-center">
                            <span class="font-weight-bold">Please NOTE:</span> After 30 days, an in browser reminder will be shown to non-subscribers.
                            <v-btn variant="plain" class="text-caption" text="(read more)" href="https://june07.com/please-do-not-be-an-a55-hole/" :ripple="false" />
                        </div>
                    </div>
                </v-container>
            </highlight-card>
            <v-spacer style="height: 200px"></v-spacer>
        </v-parallax>
    </v-container>
</template>
<style scoped>
body {
    transition: transform 2s;
}

:deep() .v-card {
    border-radius: 0;
}

:deep() .opaque-image>img {
    background-color: rgb(255, 255, 255, 1);
    color: white;
}

.company-logo {
    width: 100px;
    height: 75px;
    max-height: 100px;
    max-width: 100px;
    aspect-ratio: 3/2;
    object-fit: contain;
}

.nim-ui {
    margin: auto;
    vertical-align: middle;
    max-height: 600px;
    max-width: 800px;
}

:deep() .h-card-1 .v-card-subtitle {
    overflow: visible;
}
</style>
<script setup>
import 'animate.css'
import { ref, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useRoute } from 'vue-router'

import HighlightCard from './HighlightCard.vue'
import NimUI from './NimUI.vue'

const loaded = ref({
    iframe: false,
    page: false
})
const haterRef = ref()
const asssRef = ref()
const ogRef = ref()
const route = useRoute()
const { smAndDown } = useDisplay()
const debounced = ref(false)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]] // Swap elements
    }
    return array
}
const hovered = ref({
    hearts: false,
})
const installMethods = [
    {
        name: 'Chrome Web Store',
        href: 'https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj',
        text: 'chrome',
        icon: '/chrome_32x32.png',
    },
    {
        name: 'Edge Add-ons',
        href: 'https://microsoftedge.microsoft.com/addons/detail/nodejs-v8-inspector-ma/injfmegnapmoakbmnmnecjabigpdjeme',
        text: 'edge',
        icon: '/edge_32x32.png',
    },
    {
        name: 'GitHub Release',
        href: 'https://github.com/june07/nimv3/releases',
        text: 'github',
        svg: '/github-mark.svg',
        inverted: true,
    },
]
const companies = shuffleArray([
    { id: 1, name: 'Salesforce', logo: '/logos/Salesforce.com_logo.svg' },
    { id: 2, name: 'Microsoft', logo: '/logos/microsoft-logo.svg' },
    { id: 3, name: 'Wix', logo: '/logos/Wix.com_website_logo.svg', inverted: true },
    { id: 4, name: 'Sony', logo: '/logos/Sony_logo.svg', inverted: true },
    { id: 5, name: 'Walmart', logo: '/logos/Walmart_logo.svg' },
    { id: 6, name: 'Atlassian', logo: '/logos/horizontal-logo-gradient-blue-atlassian.svg' },
    { id: 7, name: 'eBay', logo: '/logos/EBay_logo.svg' },
    { id: 8, name: 'Uber', logo: '/logos/Uber_logo_2018.svg', inverted: true },
    { id: 9, name: 'Verizon', logo: '/logos/Verizon_2015_logo_-vector.svg', inverted: true },
    { id: 10, name: 'Netflix', logo: '/logos/Netflix_2015_logo.svg' },
    { id: 11, name: 'Docusign', logo: '/logos/DocuSign_Logo.svg', inverted: true },
    { id: 12, name: 'ADP', logo: '/logos/Automatic_Data_Processing_(logo).svg' },
    { id: 13, name: 'Coda', logo: '/logos/Coda.io_Logo.svg' },
    { id: 14, name: 'Intuit', logo: '/logos/Intuit_Logo.svg' },
    { id: 15, name: 'Capital One', logo: '/logos/Capital_One_logo.svg' },
    { id: 16, name: 'HubSpot', logo: '/logos/HubSpot_Logo.svg' },
    { id: 17, name: 'SAP', logo: '/logos/SAP_2011_logo.svg' },
    { id: 18, name: 'MercadoLibre', logo: '/logos/idsG39hA_8_1720332145027.svg' },
])
async function randomlyReanimate() {
    if (debounced.value) return
    debounced.value = setTimeout(() => {
        debounced.value = undefined
    }, 7000)
    const elements = document.querySelectorAll('.animate__animated.animate__heartBeat')

    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 4000) + 3000))
    elements.forEach(element => {
        element.classList.remove('animate__animated', 'animate__heartBeat')
        setTimeout(() => {
            element.classList.add('animate__animated', 'animate__heartBeat')
        }, 50)
    })
}
function showHaterMessage(isIntersecting) {
    if (isIntersecting) {
        haterRef.value.style.display = 'inherit'
        haterRef.value.classList.add('animate__zoomInLeft')
    }
}
function renderIframe() {
    const iframe = document.createElement('iframe')

    iframe.src = "https://asss.june07.com/app/nim?hideShare=1"
    iframe.style.border = 'none'
    iframe.width = "100%"
    iframe.height = "450"
    iframe.title = "June07 Asss project https://github.com/june07/asss"

    // Handle the iframe load event
    iframe.onload = () => {
        loaded.value.iframe = true
    }
    // Append iframe to the container
    asssRef.value.appendChild(iframe)
}
onMounted(() => {
    renderIframe()

    if (route.hash === '#asss') {
        setTimeout(() => {
            window.scrollTo({
                behavior: 'smooth',
                top: asssRef.value.getBoundingClientRect().top - document.body.getBoundingClientRect().top - 100,
            })
        }, 500)
    } else if (route.hash === '#og') {
        setTimeout(() => {
            document.body.style.transform = 'scale(2)'
            document.body.style.transformOrigin = 'top'
        }, 500)
    }
    function animationEndEvent2() {
        haterRef.value.style.display = 'none'
        haterRef.value.classList.remove('animate__hinge')
        haterRef.value.removeEventListener('animationend', animationEndEvent2)
        haterRef.value.addEventListener('animationend', animationEndEvent)
    }
    function animationEndEvent() {
        setTimeout(() => {
            haterRef.value.classList.remove('animate__zoomInLeft')
            haterRef.value.classList.add('animate__hinge')
            haterRef.value.removeEventListener('animationend', animationEndEvent)
            haterRef.value.addEventListener('animationend', animationEndEvent2)
        }, 1000)
    }
    haterRef.value.addEventListener('animationend', animationEndEvent)
    watch(() => loaded.value.iframe, () => {
        loaded.value.page = true
    })
})
</script>
