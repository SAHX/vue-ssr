const fs = require('fs')
const path = require('path')
const express = require('express')
const { createBundleRenderer } = require('vue-server-renderer')
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

const resolve = file => path.resolve(__dirname, file)

const template = fs.readFileSync(resolve('./src/index.template.html'), 'utf-8')
const renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false, // 推荐
    template, // （可选）页面模板
    clientManifest // （可选）客户端构建 manifest
})

const server = express()

const serve = (path, cache) => express.static(resolve(path), {
    maxAge:  1000 * 60 * 60 * 24 * 30
})
server.use('/dist', serve('./dist', true))
server.use('/public', serve('./public', true))
server.use('/manifest.json', serve('./manifest.json', true))
server.use('/service-worker.js', serve('./dist/service-worker.js'))
server.get('*', (req, res) => {
    const context = { url: req.url }
    console.log(req.url)
    renderer.renderToString(context, (err, html) => {
        if (err) {
            if (err.code === 404) {
                res.status(404).end('Page not found')
            } else {
                res.status(500).end('Internal Server Error')
            }
        } else {
            res.end(html)
        }
    })
})

const port = 8080
server.listen(port, () => {
    console.log(`server started at localhost:${port}`)
})