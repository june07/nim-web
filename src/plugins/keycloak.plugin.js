import { until } from 'async'
import Keycloak from 'keycloak-js'
import { ref } from 'vue'

function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
}

// Encrypt Data
async function encryptData(data, password) {
    const encoder = new TextEncoder()
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Derive key
    const key = await deriveKey(password, salt)

    // Encrypt data
    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(data)
    )

    return JSON.stringify({
        ciphertext: arrayBufferToBase64(encryptedData),
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
    })
}
async function decryptData(encryptedData, sub) {
    const dec = new TextDecoder()

    // Extract stored components: IV + encrypted content
    const encryptedObj = JSON.parse(encryptedData)
    const iv = base64ToArrayBuffer(encryptedObj.iv)
    const salt = base64ToArrayBuffer(encryptedObj.salt) // Retrieve the salt
    const encryptedBuffer = base64ToArrayBuffer(encryptedObj.ciphertext)

    // Derive key from sub
    const key = await deriveKey(sub, salt)

    // Decrypt data
    const decryptedArrayBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encryptedBuffer
    )

    return JSON.parse(dec.decode(decryptedArrayBuffer))
}

// Helper function to derive an AES key from the sub
async function deriveKey(password, salt) {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    )

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,  // Use the dynamically generated salt
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    )
}
async function onPiniaLoad(pinia, options) {
    const { sub } = options

    await until(
        async () => await pinia.state.value?.app.aname,
        async () => await new Promise(resolve => setTimeout(resolve))
    )

    const { keypair, keypairs } = pinia.state.value.app.aname
    const stringifiedKeypair = JSON.stringify(keypair)

    if (!keypairs[sub] && stringifiedKeypair !== '{}') {
        pinia.state.value.app.aname.keypairs[sub] = await encryptData(stringifiedKeypair, sub)
    } else if (keypairs[sub]) {
        pinia.state.value.app.aname.keypair = await decryptData(keypairs[sub], sub)
    }

    setInterval(() => {
        if (!keycloak.value.tokenParsed || keycloak.value.tokenParsed.exp * 1000 < Date.now()) {
            console.warn("Session expired, clearing stored keys.")
            pinia.state.value.app.aname.keypair = {}
            pinia.state.value.app.aname.publicKey = undefined
        }
    }, 30000) // Check every 30 seconds
}

const keycloakPlugin = {
    async install(app, options) {
        const { keycloakConfig } = options
        const keycloak = ref(new Keycloak(keycloakConfig))

        delete options.keycloakConfig

        keycloak.value.isLoading = true
        keycloak.value.isLoaded = new Promise(resolve => until(
            callback => { /** console.log('.'); */callback(null, keycloak.value.isAuthenticated !== undefined) },
            async () => await new Promise(resolve => setTimeout(resolve)),
            () => {
                keycloak.value.isLoading = false
                resolve(true)
            }
        ))

        app.config.globalProperties.$keycloak = keycloak

        try {
            keycloak.value.onAuthSuccess = () => {
                onPiniaLoad(options.pinia, { sub: keycloak.value.idTokenParsed.sub })
            }
            // Initialize Keycloak and set it to keycloakRef
            keycloak.value.isAuthenticated = await keycloak.value.init(options)
        } catch (error) {
            console.warn('Failed to initialize adapter:', error)
        }
    }
}

export default keycloakPlugin
