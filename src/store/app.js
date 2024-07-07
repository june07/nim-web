import { defineStore } from "pinia"

export const useAppStore = defineStore("app", {
    state: () => ({
        file: undefined,
        serverId: undefined,
        resolutions: [16, 32, 48, 128],
        outputFormat: 'png',
    }),
    persist: true,
})
