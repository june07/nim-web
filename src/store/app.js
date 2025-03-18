import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
    state: () => ({
        faq: {},
        ihotd: {
            adSales: {},
            paymentIntent: undefined
        },
        aname: {
            metadata: {},
            separator: '-',
            suffixLength: 3,
            salt: `${Date.now()}`,
            generated: {},
            lookups: {},
            keypair: {},
            publicKey: undefined,
            entropyMode: false,
        }
    }),
    persist: true,
})
