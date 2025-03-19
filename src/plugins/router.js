// Composables
import { createRouter, createWebHistory } from 'vue-router'

export default (app) => {
    const setupRoutes = $keycloak => {
        const { login, logout } = $keycloak.value

        return [
            {
                path: '/',
                name: 'home',
                component: () => import('@/views/Home.vue')
            },
            {
                path: '/faq',
                name: 'faq',
                meta: {
                    title: 'Frequently Asked Questions',
                    menu: 'FAQ'
                },
                component: () => import('@/views/FAQ.vue')
            }, {
                path: '/aname',
                name: 'aname',
                meta: {
                    title: 'A Naming Tool',
                    menu: 'Aname'
                },
                component: () => import('@/views/Aname.vue')
            }, {
                path: '/docs',
                name: 'docs',
                meta: {
                    title: 'JavaScript V8 Platform API Documentation Search Tool',
                    menu: 'Docs'
                },
                component: () => import('@/views/Docs.vue')
            }, {
                path: '/signin',
                name: 'Web App Sign In',
                component: () => import('@/views/Aname.vue'),
                beforeEnter: (to) => {
                    login({
                        action: to.query.action,
                        redirectUri: to.query.redirectUri || window.location.origin
                    })
                },
                alias: ['/login']
            }, {
                path: '/signout',
                name: 'Web App Sign Out',
                component: () => import('@/views/Aname.vue'),
                beforeEnter: () => {
                    logout({ redirectUri: document.location.origin })
                },
                alias: ['/logout']
            }, {
                path: '/ihotd',
                name: 'indihackeroftheday',
                meta: {
                    title: 'Indi Hacker of the Day',
                },
                beforeEnter(to, from, next) {
                    const meta = document.createElement('meta')
                    meta.name = 'viewport'
                    meta.content = 'width=device-width, initial-scale=1.0'
                    document.head.appendChild(meta)
                    document.title = `${to.name} by June07 - ${to.meta.title}`

                    next()
                },
                component: () => import('@/views/IndiHacker.vue')
            }, {
                path: '/stars',
                name: 'Stellar Reflection',
                meta: {
                    title: 'A GitHub App to Automatically Give a Star When One Is Received.',
                    description: 'This name evokes the idea of reflecting back the recognition received, aligning perfectly with the concept of reciprocating stars. It has a poetic and celestial feel, emphasizing the notion of shining light back to those who shine on you.',
                    menu: 'Stars'
                },
                beforeEnter(to, from, next) {
                    // Load or include your specific CSS file here
                    // For example, you can add a link tag to the head of the document
                    const link = document.createElement('link')
                    link.rel = 'stylesheet'
                    link.href = 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap'
                    document.head.appendChild(link)
                    const meta = document.createElement('meta')
                    meta.name = 'viewport'
                    meta.content = 'width=device-width, initial-scale=1.0'
                    document.head.appendChild(meta)
                    document.title = `${to.name} by June07 - ${to.meta.title}`
                    Array.from(document.querySelectorAll('link[rel="icon"]')).forEach(link => link.href = '/stellar-reflection-icon.webp')

                    next()
                },
                component: () => import('@/views/Stars.vue')
            },
            {
                path: '/:catchAll(.*)',
                name: 'catchall',
                component: () => import('@/views/NotFound.vue')
            },
        ]
    }
    const router = createRouter({
        history: createWebHistory(process.env.BASE_URL),
        routes: setupRoutes(app.config.globalProperties.$keycloak),
    })

    app.use(router)
}
