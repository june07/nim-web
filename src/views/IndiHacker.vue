<template>
    <v-container class="h-100 d-flex flex-column align-center justify-center">
        <div class="d-flex flex-column align-center justify-center" v-if="$route.query.ad">
            <v-sheet style="position: absolute; top: 0; right: auto" class="text-caption font-weight-bold px-8" rounded>Please enjoy this NiM Ad Sponsor
                <v-btn text="Why?" href="https://blog.june07.com/nim-subscription" icon="info_outline" variant="text" size="x-small" />
            </v-sheet>
            <iframe :src="$route.query.ad" style="border: none; height: 100vh; width: 100vw"></iframe>
        </div>
        <div v-else>
            <ih-card type="last" :elevation="2" :lastAd="lastAd" />
            <v-fade-transition>
                <ih-card :height="500" :elevation="12" :type="sold ? 'current' : 'buy'" :sio="sio" :tomorrow="tomorrow" :product="product" :sold="sold" :todaysAd="todaysAd" />
            </v-fade-transition>
            <v-fade-transition>
                <ih-card :height="500" :elevation="2" :type="!sold ? 'current' : 'buy'" :sio="sio" :tomorrow="tomorrow" :product="product" :sold="sold" :todaysAd="todaysAd" :countdown="countdown" />
            </v-fade-transition>
        </div>
    </v-container>
</template>
<style scoped></style>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '@/store/app'
import { io } from 'socket.io-client'
import ms from 'ms'
import 'animate.css'

import IhCard from '@/components/indiHacker/IhCard.vue'

const {
    MODE,
    VITE_APP_API_SERVER,
} = import.meta.env
const store = useAppStore()
if (MODE !== 'production') store.ihotd.adSales = {}
const sio = ref()
const now = Date.now()
const tomorrow = computed(() => {
    const date = new Date(now)

    date.setDate(date.getDate() + 1)
    date.setHours(0, 0, 0, 0)

    return date
})
const product = ref()
const lastAdPlaceholders = ref([{
    id: `prod_yaya-${new Date().toISOString().split('T')[0]}`,
    href: 'https://ai.june07.com/u/june07',
    metadata: {
        description: 'June07 - AI',
        url: 'https://ai.june07.com'
    }
}])
const countdown = ref()
const countdownInterval = ref()
const randomLastAdPlaceholder = computed(() => lastAdPlaceholders.value[Math.floor(Math.random() * lastAdPlaceholders.value.length)])
const lastAd = computed(() => [...Object.values(store.ihotd.adSales).sort((a, b) => a.date < b.date).splice(sold.value ? 1 : 0, 1), randomLastAdPlaceholder.value][0])
const sold = computed(() => Object.values(store.ihotd.adSales)?.find(sale => !sale.active && sale.id?.substring(tomorrow.value?.toISOString().split('T')[0])))
const todaysAd = computed(() => Object.values(store.ihotd.adSales).find(sale => sale.date === new Date().getDate()))
async function asyncInit() {
    ioInit()
}
async function getProductUpdate() {
    const { product: _product, lastProductsSold } = await new Promise(resolve => sio.value.emit('getAdProductForDate', {}, resolve))

    product.value = _product

    lastProductsSold?.filter(p => !p.active && !store.ihotd.adSales[p.id])
        .forEach(p => {
            store.ihotd.adSales[p.id] = p
        })

    console.log(store.ihotd.adSales)
}
function ioInit() {
    sio.value = io(VITE_APP_API_SERVER + '/ihotd', {
        transports: ['websocket']
    })

    sio.value.on('connect', async () => {
        console.info('connected to ihotd namespace')

        getProductUpdate()
    }).on('sold', () => {
        getProductUpdate()
    })
        .on('disconnect', reason => {
            console.info('disconnected from ihotd namespace: ', reason)
        })

    return sio.value
}
function startCountdown() {
    if (countdownInterval.value) clearInterval(countdownInterval.value)
    countdownInterval.value = setInterval(() => {
        countdown.value = ms(Date.parse(tomorrow.value) - Date.now(), { long: true }) // Milliseconds left in the current day
        // console.log(countdown.value, Date.parse(tomorrow.value), Date.now(), new Date(tomorrow.value).toLocaleString())
    }, 1000)
}
onMounted(() => {
    asyncInit()
    if (!!sold.value) {
        startCountdown()
    }
    watch(() => sold.value, startCountdown)
})
</script>