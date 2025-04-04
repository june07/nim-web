import axios from "axios"

const {
    MODE,
    VITE_APP_API_SERVER,
    VITE_APP_ANAME_PUBLIC_KEY
} = import.meta.env

const axiosInstance = axios.create({
    headers: {
        "x-application": "nim-web",
    },
    withCredentials: true
})
const apiService = () => {
    const request = async (passedOptions) => {
        const { auth, data, method, url, responseType } = passedOptions
        const defaultOptions = {
            url,
            method: method || 'GET',
            responseType: responseType || 'json',
        }
        let options = {
            ...defaultOptions,
            headers: auth ? {
                ...defaultOptions.headers,
                'Authorization': `Bearer ${auth.token}`
            } : defaultOptions.headers
        }
        if (data) {
            options.data = data
        }

        try {
            const response = await axiosInstance(options)
            return options.returnResponse ? response : response.data
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data)
                console.log(error.response.status)
                console.log(error.response.headers)
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request)
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message)
            }
            console.log(error.config)
            throw error
        }
    }
    return {
        request,
        assignAname: (auth) => request({ auth, url: `${VITE_APP_API_SERVER}/v1/aname/${VITE_APP_ANAME_PUBLIC_KEY}` }),
        buildInfo: async () => {
            if (MODE !== 'production' && !/dev\./.test(window.location.host)) {
                return
            }
            try {
                const { data } = await axiosInstance.get(`${window.origin}/build-info.json`, {
                    headers: {
                        'Cache-Control': 'no-store, max-age=0',
                    },
                })
                return data
            } catch (error) {
                console.log(error)
            }
        },
        releaseInfo: async function fetchLatestRelease() {
            const owner = 'june07'
            const repo = 'nim'
            const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`

            try {
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                })

                if (!response.ok) {
                    throw new Error(`Error fetching latest release: ${response.statusText}`)
                }

                const release = await response.json()
                return release
            } catch (error) {
                document.getElementById('release-info').textContent = `Error: ${error.message}`
            }
        },
        starStats: async () => await request({ url: `${VITE_APP_API_SERVER}/v1/github/stellar-reflection/stats` }),
    }
}

export default {
    async install(app) {
        app.config.globalProperties.$api = apiService()
    }
}