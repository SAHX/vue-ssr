import { createApp } from "./app"
const { app, router, store } = createApp()

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
}
// 这里采用 在路由导航之前解析数据 的策略
router.onReady(() => {
    // 添加路由钩子函数，用于处理 asyncData.
    // 在初始路由 resolve 后执行，
    // 以便我们不会二次预取(double-fetch)已有的数据。
    // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
    router.beforeResolve((to, from, next) => {
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)
        // 我们只关心之前没有渲染的组件
        // 所以我们对比它们，找出两个匹配列表的差异组件
        let diffed = false
        const activated = matched.filter((c, i) => {
            return diffed || (diffed = (prevMatched[i] !== c))
        })
        if (!activated.length) {
            return next()
        }
        // 这里如果有加载指示器(loading indicator)，就触发
        console.log('加载开始：', new Date().getTime()/1000)
        Promise.all(activated.map(Component => {
            // 调用组件上的自定义的静态函数 asyncData
            if (Component.asyncData) {
                return Component.asyncData({ store, route: to })
            }
        })).then(() => {
            // 停止加载指示器(loading indicator)
            console.log('加载结束：', new Date().getTime()/1000)
            next()
        }).catch(next)
    })
    app.$mount('#app')
})
