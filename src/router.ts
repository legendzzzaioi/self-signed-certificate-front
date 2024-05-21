import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Index',
        component: () => import('./components/Index.vue'),
        meta: { title: 'Index' },
    },
    {
        path: '/files',
        name: 'Files',
        component: () => import('./components/Files.vue'),
        meta: { title: 'Files' },
    },
    {
        path: '/result',
        name: 'Result',
        component: () => import('./components/Result.vue'),
        meta: { title: 'Result' },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, _, next) => {
    if (to.meta.title) {
        document.title = to.meta.title as string;
    }
    next();
});

export default router;
