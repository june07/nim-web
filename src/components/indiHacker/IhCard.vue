<template>
    <v-card v-if="type === 'buy'" :width="width" rounded="lg" :elevation="elevation" class="ma-8 pa-8">
        <v-card-title>
            <div v-if="!sold" class="d-flex flex-inline" style="position: relative">Tomorrows<div style="position: absolute; top: -10px; left: 14px" class="text-caption font-weight-light">({{ tomorrowLocaleString }})</div>
                <div class="ml-2">ad slot only</div>
                <div ref="dollarAmountRef" :style="dollarAmountStyle" class="font-weight-bold animate__animated animate__zoomInLeft ml-2" :class="animationEnded.dollarAmount ? 'text-green-darken-2' : ''">{{ dollarAmount }}</div>
            </div>
            <div v-else></div>
        </v-card-title>
        <v-card-subtitle>Viewed daily by over <span class="font-weight-bold">1k</span> active Node.js Devs.</v-card-subtitle>
        <v-card-text>
            <v-list class="mb-8 text-caption" density="compact" lines="1">
                <v-list-item v-for="bullet of bulletPoints">
                    <div>{{ bullet.text }}</div>
                    <template v-slot:prepend>
                        <v-icon class="mx-n4 material-symbols-outlined" :icon="bullet.icon" :size="bullet.iconSize || 40" :color="bullet.iconColor" />
                    </template>
                </v-list-item>
            </v-list>
            <div class="text-caption" v-if="!!sold">Purchasing for {{ dayAfterTomorrow.toLocaleDateString() }} enabled in {{ countdown }}</div>
            <v-form ref="formRef" :disabled="!!sold">
                <v-text-field class="mb-2" variant="outlined" placeholder="Your Project's Description (optional, but recommended)" persistent-hint hint="Description is shown in Today's Project" v-model="form.description" density="compact" />
                <v-text-field class="mt-2" variant="outlined" placeholder="Your Project's URL" persistent-hint hint="Where to send traffic tomorrow?" :rules="rules" v-model="form.url" density="compact">
                    <template v-slot:append-inner>
                        <v-btn size="small" variant="flat" color="primary" text="buy" v-if="!sold" @click="paymentHandler" />
                    </template>
                </v-text-field>
            </v-form>
            <v-dialog v-model="dialog">
                <v-card class="mx-auto pa-8" rounded="lg" flat :width="smAndDown ? '100%' : 500">
                    <form ref="paymentFormRef" id="payment-form">
                        <div id="payment-element">
                            <!-- Elements will create form elements here -->
                        </div>
                        <div id="error-message">
                            <!-- Display error message to your customers here -->
                        </div>
                    </form>
                    <v-card-actions class="d-flex justify-center">
                        <v-btn id="submit" variant="tonal" rounded="xl" class="mt-8" @click="submitPaymentHandler">Buy</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card-text>
    </v-card>


    <v-card v-else-if="type === 'last'" :width="width" :height="height" rounded="lg" :elevation="elevation" class="ma-8 pa-2">
        <v-card-title>
            <div class="text-h4">Last Indie Hacker</div>
        </v-card-title>
        <v-card-subtitle class="d-flex flex-column">
            <div v-if="lastAdDate">{{ new Date(lastAdDate).toLocaleDateString() }}</div>
        </v-card-subtitle>
        <v-card-text>
            <div class="d-flex align-center text-body-1 mb-8">
                <div class="d-flex align-center" v-if="lastAd.metadata">
                    <div>{{ lastAd.metadata.description }}</div>
                    <v-btn v-if="toURL(lastAd.metadata.url)?.host" class="text-caption ml-4" density="compact" variant="text" :href="lastAd.metadata.url" target='_blank' :text="toURL(lastAd.metadata.url).host" append-icon="link" :ripple="false" />
                </div>
            </div>
            <div ref="viewsRef" class="d-flex flex-column align-center text-h4 ma-4 flex-inline animate__animated animate__bounceIn" style="position: absolute; right: 0; top: 0;">{{ stats.find(s => s.name === 'views').count }}
                <v-chip text="views" size="x-small" label class="font-weight-bold" color="green" />
            </div>
        </v-card-text>
    </v-card>


    <v-card v-else-if="type === 'current'" :width="width" :height="height" rounded="lg" :elevation="elevation" class="d-flex flex-column align-center ma-8 pa-8">
        <v-card-title>
            <div v-if="!sold">Tomorrows ad spot is still available</div>
            <div v-else class="d-flex flex-inline" style="position: relative">Tomorrows<div style="position: absolute; top: -10px; left: 14px" class="text-caption font-weight-light">({{ tomorrowLocaleString }})</div>
                <div class="ml-2">spot sold for</div>
                <div ref="dollarAmountSoldRef" :style="dollarAmountStyle" class="font-weight-bold animate__animated animate__zoomInLeft ml-2" :class="animationEnded.dollarAmountSold ? 'text-green-darken-2' : ''">{{ dollarAmount }}</div>
            </div>
        </v-card-title>
        <v-card-subtitle class="d-flex flex-inline">
            <div v-if="!sold">Purchase above <span class="text-h4">☝️</span></div>
            <div v-if="todaysAd" class="ml-2">& checkout todays Indie Hacker <span class="text-h4">👇</span></div>
        </v-card-subtitle>
        <v-card-text class="text-center font-weight-light font-italic text-start">
            <p class="mb-4">This page was built with a dual purpose. To give indie hackers a low cost alternative to traditional ad platforms and to buck the corporate ad pigs entirely... and also to support my own indie hacker tool <a href="https://june07.com/nim" target="_blank" rel="noreferrer noopener">NiM</a>.</p>
            <p class="mb-4">The target audience includes Node.js developers and NiM users. The ad barrier is effectively addressed, as these users have chosen to view <a target="_blank" href="https://blog.june07.com/nim-subscription">the ad message</a> in exchange for not purchasing a license—offering prime placement for your advertisement.</p>
            <p class="mt-4">Visit the <router-link to="faq?category=indi_hacker">FAQ</router-link> for answers to your questions and/or reach out to <a href="mailto:667@june07.com?subject=Ad%20Inquiry">me</a></p>
            <div v-if="todaysAd" class="text-caption">Todays Project</div>
        </v-card-text>
        <v-card-actions>
            <v-btn v-if="todaysAd" class="mt-8" size="large" variant="outlined" color="primary" :text="todaysAd?.metadata?.description || `Today's Indie Hacker Project`" href="https://ihotd.june07.com" target="_blank" />
        </v-card-actions>
    </v-card>
</template>
<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { useAppStore } from '@/store/app'
import { useDisplay } from 'vuetify'

const {
    MODE,
    VITE_APP_STRIPE_KEY
} = import.meta.env
const stripe = ref()
const form = ref({
    url: undefined,
    description: undefined
})
const store = useAppStore()
const animationEnded = ref({
    dollarAmount: false,
    dollarAmountSold: false
})
const elements = ref()
const dialog = ref(false)
const formRef = ref()
const dollarAmountRef = ref()
const dollarAmountSoldRef = ref()
const { smAndDown } = useDisplay()
const bulletPoints = [
    { icon: 'trending_down', text: `Price of the ad decreases $1 every hour of the day until sold.`, iconColor: 'green-darken-2' },
    { icon: 'counter_1', text: `Only a single ad slot is sold per day, never oversold.`, iconColor: 'amber-darken-2' },
    { icon: 'calendar_clock', text: `New ad slot sale begins at the start of each day.`, iconColor: 'blue-darken-2' }
]
const dollarAmount = computed(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(props.product?.default_price?.unit_amount / 100 || 29.99))
const dollarAmountSold = computed(() => props?.sold?.default_price?.unit_amount && new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(props.sold.default_price.unit_amount / 100))
const currencySymbol = new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: 'USD'
}).formatToParts(1).find(part => part.type === 'currency').value
const paymentIntent = computed(() => store.ihotd.paymentIntent)
const tomorrowLocaleString = computed(() => props.tomorrow?.toLocaleDateString())
const dayAfterTomorrow = computed(() => {
    const date = new Date(props.tomorrow)

    date.setDate(date.getDate() + 1) // Add one day to the tomorrow date
    return date // Return the updated date object
})
const dollarAmountStyle = computed(() => ({
    transition: 'color 3s ease-in'
}))
const rules = [
    v => !!v || 'URL is required',
    v => /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}([\/\w .-]*)*\/?$/i.test(v) || 'Please enter a valid URL'
]
const lastAdDate = computed(() => props.lastAd.id?.match(/\d{4}-\d{2}-\d{2}/)[0])
const width = computed(() => smAndDown.value ? '100%' : 500)
const props = defineProps({
    elevation: {
        type: Number,
        default: 0
    },
    height: Number,
    type: String,
    sio: Object,
    tomorrow: Date,
    dollarAmount: String,
    sold: Object,
    product: Object,
    lastAd: Object,
    todaysAd: Object,
    countdown: String
})
const stats = computed(() => props.lastAd?.stats || [{
    name: 'views',
    count: 4231
}])

function toURL(_url) {
    try {
        return _url && new URL(_url)
    } catch (error) {
        console.error(error)
    }
}
function cleanPayload(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v))
}
function animateNumber(element, start, end, duration, prepend) {
    let startTime = null

    function updateNumber(currentTime) {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        const currentValue = Math.floor(progress * (end - start) + start)

        element.textContent = `${prepend}${currentValue}`

        if (progress < 1) {
            requestAnimationFrame(updateNumber)
        }
    }

    requestAnimationFrame(updateNumber)
}
async function paymentHandler() {
    let paymentElement

    dialog.value = true

    if (MODE !== 'production' || !paymentIntent.value) {
        const paymentIntent = await new Promise(resolve => props.sio.emit('createPaymentIntent', cleanPayload({
            idempotencyKey: crypto.randomUUID(),
            amount: props.product.default_price.unit_amount,
            metadata: {
                productId: props.product.id,
                ...form.value
            }
        }), resolve))

        store.ihotd.paymentIntent = paymentIntent
    }

    const options = {
        clientSecret: paymentIntent.value?.client_secret,
        appearance: {
            theme: store.theme === 'dark' ? 'night' : 'default',
        }
    }

    // Set up Stripe.js and Elements to use in checkout form
    elements.value = stripe.value.elements(options)
    paymentElement = elements.value.create('payment')

    nextTick(() => {
        paymentElement.mount('#payment-element')
    })
}
async function submitPaymentHandler() {
    const { error: submitError } = await elements.value.submit()

    const { error } = await stripe.value.confirmPayment({
        elements: elements.value,
        clientSecret: paymentIntent.value?.client_secret,
        confirmParams: {
            return_url: `${window.location.origin}/ihotd`,
        }
    })

    store.ihotd.paymentIntent = undefined
}
async function asyncInit() {
    stripe.value = await loadStripe(VITE_APP_STRIPE_KEY)
}
onMounted(() => {
    asyncInit()
    dollarAmountRef.value?.addEventListener('animationend', () => animationEnded.value['dollarAmount'] = true)
    dollarAmountSoldRef.value?.addEventListener('animationend', () => animationEnded.value['dollarAmountSold'] = true)

    function setupAnimation(el, start, end) {
        const numeric = parseInt(end.replace(/[^\d.-]/g, ''), 10)

        animateNumber(el, start, numeric, 1500, currencySymbol)
    }

    if (dollarAmountSold.value && dollarAmountSoldRef.value) setupAnimation(dollarAmountSoldRef.value, 0, dollarAmountSold.value)
    watch(() => dollarAmount.value, (newValue, oldValue) => {
        if (!dollarAmountRef.value) return
        const numericOld = parseInt(oldValue.replace(/[^\d.-]/g, ''), 10)
        const numericNew = parseInt(newValue.replace(/[^\d.-]/g, ''), 10)

        animateNumber(dollarAmountRef.value, numericOld, numericNew, 1500, currencySymbol)
    })
    watch(() => dollarAmountSold.value, (dollarAmountSold) => {
        if (dollarAmountSold && dollarAmountSoldRef.value) {
            setupAnimation(dollarAmountSoldRef.value, 0, dollarAmountSold)
        }
    })
})
</script>