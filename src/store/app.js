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
            lookupsGithub: {
                anonymous: {},
            },
            keypair: {},
            keypairs: {},
            publicKey: undefined,
            entropyMode: false,
            apikeys: [],
            availableDictionaries: [
                'https://github.june07.com/dictionary/adjs.txt',
                'https://github.june07.com/dictionary/colors.txt',
                'https://github.june07.com/dictionary/nouns.txt',
                'https://github.june07.com/dictionary/countries.txt',
                'https://github.june07.com/dictionary/languages.txt',
                'https://github.june07.com/dictionary/girls.txt',
                {
                    colors: ['red', 'green', 'blue'],
                }
            ]
        }
    }),
    persist: true,
})
