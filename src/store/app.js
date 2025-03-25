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
            generated: {
                anonymous: {},
            },
            lookups: {
                anonymous: {},
            },
            keypair: {},
            keypairs: {},
            publicKey: undefined,
            entropyMode: false,
            apikeyData: {},
            availableDictionaries: [
                'https://github.june07.com/dictionary/adjs.txt',
                'https://github.june07.com/dictionary/colors.txt',
                'https://github.june07.com/dictionary/nouns.txt',
                {
                    colors: ['red', 'green', 'blue'],
                }
            ]
        }
    }),
    persist: true,
})
