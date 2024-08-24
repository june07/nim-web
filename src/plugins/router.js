// Composables
import { createRouter, createWebHistory } from 'vue-router'

export default (app) => {
    const setupRoutes = $keycloak => {
        const { isAuthenticated, isLoading } = $keycloak

        return [
            {
                path: '/faq',
                name: 'faq',
                meta: {
                    title: 'Frequently Asked Questions',
                    menu: 'FAQ'
                },
                component: () => import('@/views/FAQ.vue')
            }, {
                path: '/docs',
                name: 'docs',
                meta: {
                    title: 'JavaScript V8 Platform API Documentation Search Tool',
                    menu: 'Docs'
                },
                component: () => import('@/views/Docs.vue')
            }, {
                path: '/stars',
                name: 'Stellar Reflection',
                meta: {
                    title: 'A GitHub App to Automatically Give a Star When One Is Received.',
                    description: 'This name evokes the idea of reflecting back the recognition received, aligning perfectly with the concept of reciprocating stars. It has a poetic and celestial feel, emphasizing the notion of shining light back to those who shine on you.',
                    menu: 'Stars'
                },
                component: () => import('@/views/Stars.vue')
            }, {
                path: '/:catchAll(.*)',
                name: 'catchall',
                component: () => import('@/views/Home.vue')
            },
        ]
    }
    const router = createRouter({
        history: createWebHistory(process.env.BASE_URL),
        routes: setupRoutes(app.config.globalProperties.$keycloak),
    })

    app.use(router)
}
