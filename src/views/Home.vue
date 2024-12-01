<template>
	<v-container fluid class="py-0">
		<NimMain />
		<v-overlay :model-value="overlay" class="align-center justify-center" style="opacity: 0.98">
			<v-card rounded width="70vw" height="50vh" class="px-16" style="overflow: auto">
				<v-card-title class="d-flex align-center justify-center mb-n2"
					><span class="text-uppercase text-red-darken-4 mr-1">Thank you</span>for using Node Inspector Manager
					<div @mouseleave="randomlyReanimate">
						<div class="loved">
							<div class="heart1 animate__animated animate__heartBeat">❤️</div>
							<div class="heart2 animate__animated animate__heartBeat">❤️</div>
							<div class="heart3 animate__animated animate__heartBeat">❤️</div>
						</div>
					</div>
				</v-card-title>
				<v-card-subtitle>
					<div class="d-flex align-center justify-center">The<span class="font-weight-bold mx-1">SWEETEST</span> and <span class="font-weight-bold mx-1">BEST</span> way to debug JavaScript V8 runtimes!</div>
				</v-card-subtitle>
				<v-card-text class="d-flex flex-column align-center justify-center">
					<div class="text-h6"><span class="font-weight-bold text-h5 mr-2">Please Note:</span>Due to a bug in Google's Chromium browser that Google has refused to fix, you may need to open DevTools manually the first time you run the application:</div>

					<div class="text-caption font-weight-bold" :class="smAndDown ? 'mt-0' : 'mt-n4'">Additional info:</div>
					<ul class="text-caption">
						<li><a href="https://blog.june07.com/chromium-bug-900945">https://blog.june07.com/chromium-bug-900945</a></li>
						<li><a href="https://issues.chromium.org/issues/41423865" target="_blank" rel="noopener">https://issues.chromium.org/issues/41423865</a></li>
						<li><a href="https://bugs.chromium.org/p/chromium/issues/detail?id=900945" target="_blank" rel="noopener">https://bugs.chromium.org/p/chromium/issues/detail?id=900945</a></li>
					</ul>

					<div class="text-h5 font-weight-bold mt-8">Quick Start</div>
					<p class="text-body-1">NiM is easy to use, and there's not much to do after installation. To integrate it into your development workflow, simply start Node.js or Deno with the <code class="code">--inspect</code> flag. NiM will automatically open a new DevTools tab and handle everything for you.</p>
					<ul class="text-caption mt-4">
						<li class="mb-4">
							<div class="d-flex align-center text-h6 ml-2"><v-img class="mr-2" src="/node-favicon.ico" max-width="24" max-height="24" contain alt="Node.js logo"></v-img>Node.js</div>
							<v-sheet color="grey-lighten-3" class="pa-2 pl-4 code" rounded="lg">> node --inspect app.js</v-sheet>
							or any other --inspect like flag which are all listed here <a href="https://nodejs.org/en/learn/getting-started/debugging#command-line-options" target="_blank" rel="noopener">https://nodejs.org/en/learn/getting-started/debugging#command-line-options</a>
						</li>
						<li class="mb-4">
							<div class="d-flex align-center text-h6 ml-2"><v-img class="mr-2" src="/deno-favicon.ico" max-width="24" max-height="24" contain alt="Deno logo"></v-img>Deno.js</div>
							<v-sheet color="grey-lighten-3" class="pa-2 pl-4 code" rounded="lg">> deno run --inspect your_script.ts</v-sheet>
							or any other --inspect like flag which are all listed here <a href="https://docs.deno.com/runtime/manual/basics/debugging_your_code/" target="_blank" rel="noopener">https://docs.deno.com/runtime/manual/basics/debugging_your_code/</a>
						</li>
					</ul>

					<div class="text-h5 font-weight-bold mt-8">Additional Resources</div>
					<p class="text-body-1">
						Don't forget to check the <a href="https://blog.june07.com/tag/nim/" target="_blank" rel="noopener">Blog</a> regularly as well as <a href="https://github.com/june07/NiMV3" target="_blank" rel="noopener">GitHub</a> for updates and issues and/or the <router-link to="/faq">FAQ</router-link>!
					</p>
				</v-card-text>
			</v-card>
		</v-overlay>
	</v-container>
</template>
<style scoped>
.v-card-subtitle {
	opacity: 1;
}
.v-sheet.code {
	font-family: monospace;
	font-weight: bold;
}
.code {
	text-wrap: nowrap;
	background-color: #eeeeee;
}
</style>
<style>
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
</style>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import NimMain from '../components/NimMain.vue'

const route = useRoute()
const overlay = computed(() => (route.query.installed && route.path === '/' ? true : false))
</script>
