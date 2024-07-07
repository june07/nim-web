<template>
    <v-container fluid>
        <v-parallax src="/irvan-smith-5eBW5GomfhY-unsplash.jpg" height="100vh" min-height="2160px">
            <v-spacer style="height: 100px"></v-spacer>
            <NimUI class="nim-ui" />
            <v-container class="d-flex justify-center align-center">
                <div class="install-buttons" v-for="method of installMethods">
                    <v-btn variant="tonal" color="green-darken-2" :href="method.href" :text="method.text" rounded="lg" class="px-4 mr-2">
                        <template v-slot:prepend>
                            <v-img :src="method.icon" width="32" height="32" class="mx-1" />
                        </template>
                    </v-btn>
                </div>
            </v-container>
            <v-spacer style="height: 400px"></v-spacer>
            <highlight-card ref="h-card-1" subtitle="" height="600" class="mr-16 rounded-e-lg" titleClass="text-center anton-regular" :style2="{ background: 'linear-gradient(90deg, white, transparent 10%)' }">
                <template v-slot:title>
                        <span class="text-red-darken-4 font-weight-bold text-uppercase anton-regular">Loved</span> by Developers<div class="loved">
                            <div class="heart1 animate__animated animate__heartBeat">❤️</div>
                            <div class="heart2 animate__animated animate__heartBeat">❤️</div>
                            <div class="heart3 animate__animated animate__heartBeat">❤️</div>
                        </div>
                </template>
                <iframe src="https://asss.june07.com/app/nim?hideShare=1" frameborder="0" width="100%" height="450"></iframe>
            </highlight-card>
            <v-spacer style="height: 200px"></v-spacer>
        </v-parallax>
        <v-parallax src="/joan-gamell-XmZ4GDAp9G0-unsplash.jpg" height="150vh">
            <highlight-card ref="h-card-2" title="TRUSTED by Companies" titleClass="text-center anton-regular" subtitle="Large and small" subtitleClass="text-center font-weight-light" height="300" color="black">
                <div class="d-flex justify-center">
                    <img v-for="company of companies.filter(c => c.logo)" :key="company.id" :src="company?.logo" width="100" height="100" class="mx-2" :style="company?.inverted ? 'filter: invert()' : ''" />
                </div>
            </highlight-card>
            <v-spacer style="height: 100px"></v-spacer>
            <v-card style="opacity: 0.8;" rounded="lg" color="white" class="ml-2 mr-16">
                <v-card-title class="mb-0 text-h3">Features</v-card-title>
                <v-card-subtitle class="mt-n6 mb-2 font-italic text-h6">A million ways to code, choose one.</v-card-subtitle>
                <div class="text-h5 text-end">👇</div>
            </v-card>
        </v-parallax>
    </v-container>
</template>
<style scoped>
:deep() .v-card {
    border-radius: 0;
}

.loved {
    letter-spacing: -1em;
    display: inline-flex;
}

.heart1 {
    --animate-duration: 2s;
    --animate-delay: 0.5s;
    transform: rotate(-7deg);
}

.heart2 {
    --animate-duration: 1s;
    --animate-delay: 0.2s;
    transform: rotate(7deg);
}

.heart3 {
    --animate-duration: 3s;
    --animate-delay: 1s;
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
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useAppStore } from '../store/app'

import HighlightCard from './HighlightCard.vue'
import NimUI from './NimUI.vue'

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
const installMethods = [{
    name: 'Chrome', href: 'https://chromewebstore.google.com/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj', text: 'chrome', icon: '/chrome_32x32.png'
}, {
    name: 'Edge', href: 'https://microsoftedge.microsoft.com/addons/detail/nodejs-v8-inspector-ma/injfmegnapmoakbmnmnecjabigpdjeme', text: 'edge', icon: '/edge_32x32.png'
}]
const companies = shuffleArray([
    { id: 1, name: 'Salesforce', logo: '/logos/Salesforce.com_logo.svg' },
    { id: 2, name: 'Microsoft', logo: '/logos/microsoft-logo.svg' },
    { id: 3, name: 'Wix', logo: '/logos/Wix.com_website_logo.svg', inverted: true },
    { id: 4, name: 'Sony', logo: '/logos/Sony_logo.svg', inverted: true },
    { id: 5, name: 'Walmart', logo: '/logos/Walmart_logo.svg' },
    { id: 6, name: 'Atlassian', logo: '/logos/horizontal-logo-gradient-blue-atlassian.svg' },
    { id: 7, name: 'eBay', logo: undefined },
    { id: 8, name: 'Uber', logo: undefined },
    { id: 9, name: 'Verizon', logo: undefined },
    { id: 10, name: 'Microsoft', logo: undefined },
    { id: 11, name: 'Docusign', logo: undefined },
    { id: 12, name: 'ADP', logo: undefined },
    { id: 13, name: 'Coda', logo: undefined },
    { id: 14, name: 'Intuit', logo: undefined },
    { id: 15, name: 'Capital One', logo: undefined },
    { id: 16, name: 'HubSpot', logo: undefined },
    { id: 17, name: 'SAP', logo: undefined },
    { id: 18, name: 'MercadoLibre', logo: undefined },
    { id: 19, name: 'Netflix', logo: undefined },
    { id: 20, name: 'Nim', logo: undefined }
])
onMounted(() => {

})
</script>
