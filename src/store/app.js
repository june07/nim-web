import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
    state: () => ({
        faq: {},
        ihotd: {
            adSales: {},
            paymentIntent: undefined
        }
    }),
    persist: true,
})
