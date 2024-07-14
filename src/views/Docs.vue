<template>
    <v-container class="h-100 d-flex flex-column align-center">
        <p>
            {{ selectedAPI?.name || 'Javascrip V8 Framework' }} API Search Tool
        </p>
        <ais-instant-search v-if="searchClient" :hits-per-page.camel="5" :search-client="searchClient" :index-name="selectedAPIModel" :initial-ui-state="initialUiState">
            <div class="d-flex">
                <div class="d-flex flex-column flex-grow-1">
                    <ais-search-box placeholder="Search API" />
                    <ais-powered-by style="font-size: 12px" class="ml-auto mt-2 mr-4" />
                </div>
                <v-select class="flex-shrink ml-2" style="max-width: 250px" v-model="selectedAPIModel" :items="apis" item-title="text" item-value="id" label="API" variant="outlined" density="compact">
                    <template v-slot:prepend-inner>
                        <v-img src="/node-favicon.ico" width="24" height="24" />
                    </template>
                </v-select>
            </div>
            <ais-hits class="mt-4" style="width: 70vw">
                <template v-slot="{ items }">
                    <v-expansion-panels v-for="item in items" :key="item" @update:model-value="expansionPanelsUpdateHandler" flat>
                        <v-expansion-panel>
                            <template v-slot:title>
                                <!-- {{ console.log(item) }} -->
                                <a :href="`${canonicalDocsURL}${item.source.split('/').pop().replace('.md', '.html')}#${item.textRaw.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z-]/g, '')}`" target="_blank" rel="noopener" class="mr-2"><v-img src="/node-favicon.ico" width="24" height="24" /></a>
                                <span class="font-weight-bold mr-6"><ais-highlight :hit="item" attribute="textRaw" /></span><br>
                                <div v-html="filter(item.desc.slice(0, 150))" class="d-flex text-truncate"></div>
                            </template>
                            <template v-slot:text>
                                <span v-html="filter(item.desc)"></span>
                            </template>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </template>
            </ais-hits>
        </ais-instant-search>
    </v-container>
</template>
<style scoped>
:deep() pre {
    background: #E8F5E9;
    padding: 16px;
    margin: 16px;
    border-radius: 12px;
}

:deep() .node-syntax-toggle {
    position: absolute;
    right: 0;
    margin-right: 70px;
}
.node-syntax-toggle-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    margin-right: 70px;
}
</style>
<script setup>
import { h, ref, computed, render, getCurrentInstance, watch, onMounted } from 'vue'
import { VSwitch } from 'vuetify/components'
import algoliasearch from 'algoliasearch/lite'
import 'instantsearch.css/themes/satellite-min.css'
import 'highlight.js/styles/github.css'
import hljs from 'highlight.js'

const { appContext } = getCurrentInstance()
const apis = [{
    id: 'node-20.15.1',
    name: 'Node.js',
    text: 'Node.js v20.15.1 (LTS)',
    version: '20.15.1',
    canonicalDocsURL: 'https://nodejs.org/docs/latest-v20.x/api/',
}, {
    id: 'node-22.4.1',
    name: 'Node.js',
    text: 'Node.js v22.4.1 (Latest)',
    version: '22.4.1',
    canonicalDocsURL: 'https://nodejs.org/docs/latest-v22.x/api/',
}, {
    id: 'node-18.20.4',
    name: 'Node.js',
    text: 'Node.js v18.20.4 (LTS 18)',
    version: '18.20.4',
    canonicalDocsURL: 'https://nodejs.org/docs/latest-v18.x/api/',
}]
const selectedAPIIndex = ref(0)
const selectedAPIModel = ref(apis[selectedAPIIndex.value].id)
const selectedAPI = computed(() => apis[selectedAPIIndex.value])
const canonicalDocsURL = computed(() => apis[selectedAPIIndex.value].canonicalDocsURL)
const searchClient = algoliasearch('EUFO29W4LA', 'cd313d4204c72de9cbe7d9928efb215b')
const initialUiState = ref({
    [`${selectedAPIModel.value}`]: { query: '' }
})

const nodeSyntaxToggle = ref('mjs')
function filter(htmlString) {
    return translateRelativeLinksToAbsolute(htmlString)
}
function isSameCodeBlock(lastTwoCodeBlocks) {
    const re = new RegExp(/import|require\(|async|\}\)\(\);/i)
    const block1Lines = lastTwoCodeBlocks[0].split('\n').filter(line => line && !re.test(line)).map(line => line.trim())
    const block2Lines = lastTwoCodeBlocks[1].split('\n').filter(line => line && !re.test(line)).map(line => line.trim())

    // compare the lines from each block
    const percentageMatch = block1Lines.reduce((acc, line, index) => {
        if (block2Lines.find(block2Line => block2Line === line)) {
            return index === block1Lines.length - 1 ? (acc + 1)/block1Lines.length : acc += 1
        }
        return index === block1Lines.length - 1 ? acc/block1Lines.length : acc
    }, 0)

    return percentageMatch > 0.8
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

    if (htmlString.length > 150) {
        const codeTags = Array.from(doc.querySelectorAll('pre code'))
        let codeGroups = []

        codeTags.map(async (code, index, arr) => {
            const preTag = code.parentNode
            const highlightedCode = hljs.highlight(code.innerHTML, { language: 'javascript' }).value
            const codeClassName = Array.from(code.classList).find(className => /language-/.test(className))

            if (`language-${nodeSyntaxToggle.value}` !== codeClassName) {
                preTag.style.visibility = 'hidden'
                preTag.style.height = 0
                preTag.style.padding = 0
                preTag.style.margin = 0
            }
            codeGroups.push(code.innerHTML)
            if (codeGroups.length > 1 && isSameCodeBlock(codeGroups.slice(-2))) {                
                arr[index > 0 ? index - 1 : 0].innerHTML = arr[index > 0 ? index - 1 : 0].innerHTML.replace('nst-placeholder', 'node-syntax-toggle')
                code.innerHTML = `<div id="${Date.now()}" class="node-syntax-toggle${' ' + codeClassName || ''}"></div>\n${highlightedCode}`
            } else {
                code.innerHTML = `<div class="nst-placeholder"></div>\n${highlightedCode}`
            }
        })
    }

    // Serialize the document back into an HTML string
    return  new XMLSerializer().serializeToString(doc)
}
async function expansionPanelsUpdateHandler(value) {
    if (value === undefined) return
    await new Promise(resolve => setTimeout(resolve, 500))
    
    Array.from(document.querySelectorAll('.node-syntax-toggle')).map(node => {
        const vNode = h(VSwitch, {
            class: `node-syntax-toggle-btn`,
            inset: true,
            label: nodeSyntaxToggle.value,
            modelValue: nodeSyntaxToggle.value === 'mjs' ? true : false,
            onClick: () => {
                nodeSyntaxToggle.value = nodeSyntaxToggle.value === 'mjs' ? 'cjs' : 'mjs'
                expansionPanelsUpdateHandler(true)
            }
        })
        vNode.appContext = appContext
        
        render(vNode, node)
    })
}
onMounted(() => {
    watch(() => selectedAPIModel.value, value => {
        initialUiState.value = { [`${value}`]: { query: '' } }
    })
    expansionPanelsUpdateHandler(true)
})
</script>