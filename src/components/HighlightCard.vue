<template>
    <v-card :style="{ 'opacity': opacity || '0.95', ...style }" :color="color" :class="class" :height="height">
        <v-card-title class="mb-0 text-h3" :class="titleClass">
            <slot name="title">{{ title }}</slot>
        </v-card-title>
        <v-card-subtitle class="mt-n6 mb-2 text-center text-h6 font-italic" style="opacity: 1" :class="subtitleClass">
            <slot name="subtitle">{{ subtitle }}</slot>
        </v-card-subtitle>
        <v-card-text :class="textClass">
            <slot></slot>
        </v-card-text>
    </v-card>
    <v-card style="position: relative; z-index: -1" :style="{ top: `-${height}px`, ...style2 }" :height="height">
    </v-card>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton:wght@400;700&display=swap');

.anton-regular {
    font-family: "Anton", sans-serif;
    font-weight: 400;
    font-style: normal;
}
</style>
<script setup>
import 'animate.css'
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useAppStore } from '../store/app'

defineProps({
    title: String,
    subtitle: String,
    height: {
        type: String,
        default: '600'
    },
    opacity: String,
    class: String,
    titleClass: String,
    subtitleClass: String,
    textClass: String,
    style: Object,
    style2: Object,
    color: String
})
const { smAndDown } = useDisplay()
const { $api } = getCurrentInstance().appContext.config.globalProperties
const { VITE_APP_API_SERVER } = import.meta.env
const store = useAppStore()

onMounted(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Anton:wght@400;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
})
</script>
