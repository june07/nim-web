<template>
    <v-container fluid class="h-100 d-flex flex-column align-center justify-center">
        <p>
            {{ selectedAPI?.name || 'Javascrip V8 Framework' }} API Search Tool
        </p>
        <ais-instant-search v-if="searchClient" :hits-per-page.camel="5" :search-client="searchClient" :index-name="selectedIndex">
            <div class="d-flex">
                <div class="d-flex flex-column flex-grow-1">
                    <ais-search-box />
                    <ais-powered-by style="font-size: 12px" class="ml-auto mt-2 mr-4" />
                </div>
                <v-select class="flex-shrink ml-2" style="max-width: 250px" v-model="selectedAPIModel" :items="apis" item-title="text" item-value="id" label="API" variant="outlined" density="compact">
                    <template v-slot:prepend-inner>
                        <v-img src="/node-favicon.ico" width="24" height="24" />
                    </template>
                </v-select>
            </div>
            <ais-hits>
                <template v-slot="{ items }">
                    <v-list :items lines="three">
                        <template v-slot:title="{ item }">
                            <ais-highlight :hit="item" attribute="name" highlightedTagName="desc" />
                        </template>
                        <template v-slot:subtitle="{ item }">
                            <span v-html="filter(item.desc)"></span>
                        </template>
                    </v-list>
                </template>
            </ais-hits>
        </ais-instant-search>
    </v-container>
</template>
<script setup>
import { ref, computed } from 'vue'
import algoliasearch from 'algoliasearch/lite'
import 'instantsearch.css/themes/satellite-min.css'

const apis = [{
    id: 'node-20.15.1',
    name: 'Node.js',
    text: 'Node.js v20.15.1',
    version: '20.15.1',
    canonicalDocsURL: 'https://nodejs.org/docs/latest-v20.x/api/',
}]
const selectedAPIIndex = ref(0)
const selectedAPIModel = ref(apis[selectedAPIIndex.value].id)
const selectedAPI = computed(() => apis[selectedAPIIndex.value])
const searchClient = algoliasearch('EUFO29W4LA', '59ad37c5752020c3dc125d5347f545a9')
const selectedIndex = ref('node-20.15.1')
function filter(htmlString) {
    return translateRelativeLinksToAbsolute(htmlString)
}
function translateRelativeLinksToAbsolute(htmlString) {
    // Create a DOM parser
    const parser = new DOMParser()
    // Parse the HTML string into a document
    const doc = parser.parseFromString(htmlString, 'text/html')

    // Get all anchor tags
    const anchorTags = doc.querySelectorAll('a')

    // Iterate over each anchor tag
    anchorTags.forEach(anchor => {
        const href = anchor.getAttribute('href')

        // Check if the href is a relative URL
        if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
            // Convert relative URL to absolute URL
            anchor.setAttribute('href', `${selectedAPI.value.canonicalDocsURL}${href}`)
        }
    })

    // Serialize the document back into an HTML string
    return new XMLSerializer().serializeToString(doc)
}
</script>