<template>
    <v-container fluid class="py-0">
        <v-parallax :src="`/irvan-smith-5eBW5GomfhY-unsplash${smAndDown ? '.mobile' : ''}.webp`" height="100vh" min-height="2160px">
            <v-spacer style="height: 100px"></v-spacer>
            <v-sheet ref="ogRef" class="d-flex mb-16 mx-auto" flat width="800" rounded="lg" style="opacity: 0.9">
                <div class="d-flex flex-column flex-grow-1">
                    <div class="px-8 text-body-1 pt-8 font-weight-bold">Serving Dev Tools UX Diabeetus Since 2016</div>
                    <div class="px-8 text-body-2 text-center font-italic font-weight-light">The OG <a href="https://www.youtube.com/watch?v=Xb_0awoShR8&t=524s" target="_blank" rel="noopener" class="font-weight-bold">"UX Sugar"</a> for DevTools</div>
                </div>
                <a href="https://www.youtube.com/watch?v=Xb_0awoShR8&t=524s" target="_blank" rel="noopener" class="d-flex my-4 mr-4">
                    <img src="/node-summit-paul-irish.webp" height="200" />
                </a>
            </v-sheet>
            <NimUI class="nim-ui" />
            <v-container class="d-flex justify-center align-center">
                <div class="install-buttons" v-for="method of installMethods">
                    <v-btn variant="tonal" color="green-darken-2" :href="method.href" :text="method.name" rounded="lg" class="px-4 mr-2">
                        <template v-slot:prepend>
                            <v-img :src="method.icon || method.svg" width="32" height="32" class="mx-1" :style="method?.inverted ? 'filter: invert()' : ''" />
                        </template>
                    </v-btn>
                </div>
            </v-container>
            <v-spacer style="height: 400px"></v-spacer>
            <highlight-card ref="h-card-1" subtitle="" height="600" class="mr-16 rounded-e-lg" titleClass="text-center anton-regular" :style2="{ background: 'linear-gradient(90deg, white, transparent 10%)' }">
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
                <iframe ref="asssRef" src="https://asss.june07.com/app/nim?hideShare=1" frameborder="0" width="100%" height="450"></iframe>
            </highlight-card>
            <v-spacer style="height: 200px"></v-spacer>
        </v-parallax>

        <v-parallax :src="`/joan-gamell-XmZ4GDAp9G0-unsplash${smAndDown ? '.mobile' : ''}.webp`" height="50vh" min-height="1024px">
            <v-spacer style="height: 200px"></v-spacer>
            <highlight-card ref="h-card-features" height="500" textClass="py-0 h-50 d-flex flex-column justify-end" titleClass="text-center anton-regular" subtitle="Large and Small, from Startups to Industry Leaders" subtitleClass="text-center font-weight-light" color="black">
                <div class="d-flex justify-center flex-wrap">
                    <img v-for="company of companies.filter(c => c.logo)" :key="company.id" :src="company?.logo" class="mx-2 company-logo" :style="company?.inverted ? 'filter: invert()' : ''" />
                </div>
                <template v-slot:title> <span class="text-blue-darken-4 font-weight-bold text-uppercase anton-regular">TRUSTED</span> by Companies </template>
            </highlight-card>
            <v-spacer style="height: 200px"></v-spacer>
        </v-parallax>

        <v-parallax :src="`/tai-bui-QW89whdEClA-unsplash${smAndDown ? '.mobile' : ''}.webp`" height="2200">
            <v-spacer style="height: 200px"></v-spacer>
            <highlight-card ref="h-card-1" height="1600" class="ml-16 rounded-s-lg" opacity="0.9" subtitle="by Streamlining Development Workflows" subtitleClass="text-center font-weight-light" titleClass="text-center anton-regular" :style2="{ background: 'linear-gradient(90deg, transparent 10%, white)' }">
                <template v-slot:title>
                    <div @mouseleave="randomlyReanimate">
                        <span class="font-weight-bold anton-regular text-orange-darken-2">Igniting</span> Productivity
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
                    <v-img class="mx-auto opaque-image" height="600px" width="800" src="/features-devtools-switching.png" style="border-radius: 10%" />
                </v-card>
                <!-- feature 2 -->
                <v-card color="green-lighten-5 px-8 pb-8 ma-16" class="rounded-xl">
                    <v-card-text class="d-flex justify-center align-center font-weight-bold text-capitalize"><v-chip text="feature 🔥" class="mr-2 font-weight-bold" /> Multi-session Debugging management</v-card-text>
                    <v-img class="mx-auto opaque-image" height="400px" width="800" src="/features-multisession.png" style="border-radius: 10%" />
                </v-card>
                <!-- feature 3 -->
            </highlight-card>
            <v-spacer style="height: 200px"></v-spacer>
        </v-parallax>

        <v-parallax :src="`/joan-gamell-XmZ4GDAp9G0-unsplash${smAndDown ? '.mobile' : ''}.webp`" height="100vh">
            <v-spacer style="height: 400px"></v-spacer>
            <highlight-card ref="h-card-2" height="300" title="Install Now for Free" subtitle="If you're a solo developer/student/or just don't have the budget for tools, you can still use NiM unrestricted." subtitleClass="text-center font-weight-light" class="mr-16 rounded-e-lg" titleClass="text-center anton-regular" :style2="{ background: 'linear-gradient(90deg, white, transparent 10%)' }">
                <v-container class="d-flex justify-center align-center">
                    <div class="install-buttons" v-for="method of installMethods">
                        <v-btn variant="tonal" color="green-darken-2" :href="method.href" :text="method.name" rounded="lg" class="px-4 mr-2">
                            <template v-slot:prepend>
                                <v-img :src="method.icon || method.svg" width="32" height="32" class="mx-1" :style="method?.inverted ? 'filter: invert()' : ''" />
                            </template>
                        </v-btn>
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
</style>
<script setup>
import 'animate.css'
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useRoute } from 'vue-router'

import HighlightCard from './HighlightCard.vue'
import NimUI from './NimUI.vue'

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
onMounted(() => {
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
})
</script>
