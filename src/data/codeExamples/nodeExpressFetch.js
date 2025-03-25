/**
 * Fetches or generates an `aName` for a user.
 * 
 * @param {Object} auth - Your user's authentication object.
 * @param {string} auth.sub - Your user's unique identifier (subject).
 * @param {string} auth.createdAt - Timestamp of when the user was created, used as a seed for the API request since it is unique to each user and does not change.
 * @param {string} publicKey - Your public key which is used to encrypt the generated name data.
 * @returns {Promise<Object>} - The generated or cached aName response.
 */
async function aname(auth, publicKey) {
    const { sub, createdAt } = auth // Extract user details from auth object
    let cached

    // Attempt to retrieve the cached aName from Redis
    cached = await unwrapRedisObject(redis.HGET('myapp:aname', sub))

    if (cached) {
        return cached // Return cached value if found
    }

    try {
        /** Construct the API request URL using the available options (see documentation for more details)
         * @see https://aname.june07.com/docs
        */
        const apiUrl = `${ANAME_API_URL}/v1/ai/aname?seed=${createdAt}${sub}`
            + `&suffixLength=0`
            + `&dictionaries=${encodeURIComponent(JSON.stringify([
                'https://my-hosted-dictionary.com/adjs.txt',
                'https://any-hosted-dictionary.net/colors.txt',
                'https://github.june07.com/dictionary/nouns.txt'
            ]))}`
            + `&publicKey=${publicKey}`

        // Perform the API request with your API key
        const response = await fetch(apiUrl, {
            headers: {
                'x-api-key': ANAME_API_KEY
            }
        })

        // Parse the response as JSON
        const data = await response.json()

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${data.message || 'Unknown error'}`)
        }

        // Cache the result in Redis for future requests
        await redis.HSET('myapp:aname', sub, JSON.stringify(data))

        // Update the user's myAppUsername attribute in Keycloak
        await keycloakService.updateUserAttribute(sub, 'myAppUsername', data.name)

        return data // Return the newly generated aName
    } catch (error) {
        console.error('Error fetching aName:', error) // Log to console for debugging
        throw error // Re-throw the error for handling upstream
    }
}
