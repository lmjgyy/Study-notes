'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}
const port = process.env.port || process.env.npm_config_port || 9527
const name = defaultSettings.title || 'vue Element Admin'
module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
        ? '/my-app/'
        : '/', // Default: '/', 等效于webpack配置的output下的publicPath，设置部署的根路径,如https://www.my-app.com/my-app/，则设置 publicPath 为 /my-app/
    outputDir: 'dist', // Default: 'dist' 当运行 vue-cli-service build 时生成的生产环境构建文件的目录
    assetsDir: '', // Default: '' 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
    indexPath: 'index.html',  // Default: 'index.html' 指定生成的 index.html 的输出路径 (相对于 outputDir)。也可以是一个绝对路径。
    filenameHashing: true, // Default: true  生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存
    pages: { // Default: undefined
        index: {
            // page 的入口
            entry: 'src/main.js',
            // 模板来源
            template: 'public/index.html',
            // 在 dist/index.html 的输出
            filename: 'index.html',
            // 当使用 title 选项时，
            // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: '啥玩意',
            // 在这个页面中包含的块，默认情况下会包含
            // 提取出来的通用 chunk 和 vendor chunk。
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
        // subpage: 'src/subpage/main.js'
    },
    lintOnSave: process.env.NODE_ENV !== 'prodction', // Default: true 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码
    runtimeCompiler: false, // Default: false 是否使用包含运行时编译器的 Vue 构建版本
    transpileDependencies: [], // Default: [] 默认情况下 babel-loader 会忽略所有 node_modules 中的文件。如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来。
    productionSourceMap: true, // Default: true 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建
    crossorigin: undefined, // Default: undefined 设置生成的 HTML 中 <link rel="stylesheet"> 和 <script> 标签的 crossorigin 属性。
    integrity: false, // Default: false 在生成的 HTML 中的 <link rel="stylesheet"> 和 <script> 标签上启用 Subresource Integrity (SRI)。如果你构建后的文件是部署在 CDN 上的，启用该选项可以提供额外的安全性。
    configureWebpack: {
        name: name,
        resolve: {
            alias: {
                '@': resolve('src')
            }
        }
    }, // 如果这个值是一个对象，则会通过 webpack-merge 合并到最终的配置中,如果这个值是一个函数，则会接收被解析的配置作为参数。该函数既可以修改配置并不返回任何东西，也可以返回一个被克隆或合并过的配置版本。
    chainWebpack(config){// 是一个函数，会接收一个基于 webpack-chain 的 ChainableConfig 实例。允许对内部的 webpack 配置进行更细粒度的修改。
        // config.plugins.delete('preload') // TODO: need test

        // set svg-sprite-loader
        config.module
            .rule('svg')
            .exclude.add(resolve('src/icons'))
            .end()
        config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(resolve('src/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
            .end()
        
        // set preserveWhitespace
        config.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                options.compilerOptions.preserveWhitespace = true
                return options
            })
            .end()

            config
            .when(process.env.NODE_ENV !== 'development',
              config => {
                config
                  .plugin('ScriptExtHtmlWebpackPlugin')
                  .after('html')
                  .use('script-ext-html-webpack-plugin', [{
                  // `runtime` must same as runtimeChunk name. default is `runtime`
                    inline: /runtime\..*\.js$/
                  }])
                  .end()
                config
                  .optimization.splitChunks({
                    chunks: 'all',
                    cacheGroups: {
                      libs: {
                        name: 'chunk-libs',
                        test: /[\\/]node_modules[\\/]/,
                        priority: 10,
                        chunks: 'initial' // only package third parties that are initially dependent
                      },
                      elementUI: {
                        name: 'chunk-elementUI', // split elementUI into a single package
                        priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                        test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                      },
                      commons: {
                        name: 'chunk-commons',
                        test: resolve('src/components'), // can customize your rules
                        minChunks: 3, //  minimum common number
                        priority: 5,
                        reuseExistingChunk: true
                      }
                    }
                  })
                config.optimization.runtimeChunk('single')
              }
            )
    },
    css: {
        requireModuleExtension: true, // Default: true 默认情况下，只有 *.module.[ext] 结尾的文件才会被视作 CSS Modules 模块。置为 false 后你就可以去掉文件名中的 .module 并将所有的 *.(css|scss|sass|less|styl(us)?) 文件视为 CSS Modules 模块。
        extract: process.env.NODE_ENV === 'production', // Default: 生产环境下是 true，开发环境下是 false, 是否将组件中的 CSS 提取至一个独立的 CSS 文件中 (而不是动态注入到 JavaScript 中的 inline 代码)。
        sourceMap: false, // Default: false 是否为 CSS 开启 source map。设置为 true 之后可能会影响构建的性能。
        loaderOptions: { // Default: {}
            css: {
                // 这里的选项会传递给 css-loader
            },
            postcss: {
                // 这里的选项会传递给 postcss-loader
            }
        },
        // css-loader
        // postcss-loader
        // sass-loader
        // less-loader
        // stylus-loader
    },
    devServer: {
        // proxy: 'http://localhost:4000', Type: string | Object 如果你的前端应用和后端 API 服务器没有运行在同一个主机上，你需要在开发环境下将 API 请求代理到 API 服务器。这个问题可以通过 vue.config.js 中的 devServer.proxy 选项来配置。
        // '/api': {
        //     target: 'http://localhost:4000',
        //     ws: true,
        //     changeOrigin: true
        // },
        // '/foo': {
        //     target: 'http://localhost:4000'
        // },
        proxy: {
            [process.env.VUE_APP_BASE_API]: {
                target: process.env.VUE_APP_BASE_API,
                changeOrigin: true,
                pathRewrite: {
                    ["^" + process.env.VUE_APP_BASE_API]: ''
                }
            }
        },
        port: port,
        open: true,
        host: '0.0.0.0',
        https: false,
        before: require('./mock/mock-server.js')
    },
    // parallel: require('os').cpus().length > 1 // Default: require('os').cpus().length > 1 是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建。
    pluginOptions: {
        foo: {
            // 插件可以作为 `options.pluginOptions.foo` 访问这些选项。
        }
    },
}