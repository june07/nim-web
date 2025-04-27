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
            separator: '_',
            suffixLength: '0',
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
                {
                    colors: ['black', 'white', 'red', 'green', 'yellow', 'blue', 'brown', 'orange', 'pink', 'purple', 'gray']
                },
                'https://github.june07.com/dictionary/adjs.txt',
                'https://github.june07.com/dictionary/colors.txt',
                'https://github.june07.com/dictionary/nouns.txt',
                'https://github.june07.com/dictionary/countries.txt',
                'https://github.june07.com/dictionary/languages.txt',
                'https://github.june07.com/dictionary/girls.txt',
                'https://github.june07.com/dictionary/name-thesaurus.txt'
            ]
        },
        callem: {
            form: {
                name: undefined,
                description: undefined,
                force: false
            },
        }
    }),
    persist: true,
})
