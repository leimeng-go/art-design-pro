import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath } from 'url'
// import viteImagemin from 'vite-plugin-imagemin'
// import { visualizer } from 'rollup-plugin-visualizer'

export default ({ mode }) => {
  // 当前的工作目录为root
  const root = process.cwd()
  // 加载环境变量
  const env = loadEnv(mode, root)
  // 解构环境变量
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL, VITE_API_URL } = env
  // 打印环境变量
  console.log(`🚀 API_URL = ${VITE_API_URL}`)
  console.log(`🚀 VERSION = ${VITE_VERSION}`)

  return defineConfig({
    // 定义全局变量
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    // 设置项目基础路径
    base: VITE_BASE_URL,
    // 设置项目端口
    server: {
      port: parseInt(VITE_PORT),
      // 设置代理
      proxy: {
        // 设置代理路径
        '/api': {
          // 设置代理目标
          target: VITE_API_URL,
          // 设置代理是否改变源
          changeOrigin: true,
          // 设置代理重写路径
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      // 允许外部访问
      host: true
    },
    // 路径别名
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@views': resolvePath('src/views'),
        '@comps': resolvePath('src/components'),
        '@imgs': resolvePath('src/assets/img'),
        '@icons': resolvePath('src/assets/icons'),
        '@utils': resolvePath('src/utils'),
        '@stores': resolvePath('src/store'),
        '@plugins': resolvePath('src/plugins'),
        '@styles': resolvePath('src/assets/styles')
      }
    },
    build: {
      // 设置ts构建目标为ES2015
      target: 'es2015',
      // 设置输出目录
      outDir: 'dist',
      // 设置chunk大小警告限制
      chunkSizeWarningLimit: 2000,
      // 设置压缩方式
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境去除 console
          drop_debugger: true // 生产环境去除 debugger
        }
      },
      // 设置rollupOptions，Rollup 是 Vite 的底层打包工具，Vite 的打包配置基于 Rollup 的配置
      rollupOptions: {
        output: {
          manualChunks: {
            // 将核心依赖打包到 vendor 中,将相关核心库单独打包，因为这些库很少会变动
            vendor: ['vue', 'vue-router', 'pinia', 'element-plus']
          }
        }
      },
      // 动态导入，按需加载
      dynamicImportVarsOptions: {
        // 当动态导入变量出现错误时，发出警告，这个有助于在开发过程中及时发现和修复动态导入相关的问题
        warnOnError: true,
        // 排除的文件
        exclude: [],
        // 包含的文件
        include: ['src/views/**/*.vue']
      }
    },
    plugins: [
      vue(),
      // 自动导入 components 下面的组件，无需 import 引入
      Components({
        // 搜索子目录
        deep: true,
        // 组件后缀
        extensions: ['vue'],
        // 组件目录
        dirs: ['src/components'], // 自动导入的组件目录
        // Element Plus 组件解析
        resolvers: [ElementPlusResolver()],
        // 类型申明文件路径
        dts: 'src/types/components.d.ts'
      }),
      // API 自动导入插件配置，不需要在每个文件手动import组件
      AutoImport({
        // 自动导入这些库常用的API
        imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
        // ElementPlusResolver 是一个解析器，用于识别和自动导入Element Plus的组件，这样可以直接在模版中使用Element Plus的组件，而无需手动import
        resolvers: [ElementPlusResolver()],
        // 生成一个类型申明文件，这个文件包含了自动导入的API的类型信息，帮助TypeScript提供更好的类型检查和自动补全
        dts: 'src/types/auto-imports.d.ts',
        // eslintrc配置
        eslintrc: {
          // 这里先设置成true然后pnpm dev 运行之后会生成 .auto-import.json 文件之后，在改为false
          enabled: true,
          // 指定生成的ESlint配置文件路径
          filepath: './.auto-import.json',
          // 将自动导入的API作为全局变量处理，避免ESlint报未定义错误
          globalsPropValue: true
        }
      }),
      // 打包分析
      // visualizer({
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'dist/stats.html' // 分析图生成的文件名及路径
      // }),
      // 压缩
      viteCompression({
        verbose: true, // 是否在控制台输出压缩结果
        disable: false, // 是否禁用
        algorithm: 'gzip', // 压缩算法,可选 [ 'gzip' , 'brotliCompress' ,'deflate' , 'deflateRaw']
        ext: '.gz', // 压缩后的文件名后缀
        threshold: 10240, // 只有大小大于该值的资源会被处理 10240B = 10KB
        deleteOriginFile: false // 压缩后是否删除原文件
      })
      // 图片压缩
      // viteImagemin({
      //   verbose: true, // 是否在控制台输出压缩结果
      //   // 图片压缩配置
      //   // GIF 图片压缩配置
      //   gifsicle: {
      //     optimizationLevel: 4, // 优化级别 1-7，7为最高级别压缩
      //     interlaced: false // 是否隔行扫描
      //   },
      //   // PNG 图片压缩配置
      //   optipng: {
      //     optimizationLevel: 4 // 优化级别 0-7，7为最高级别压缩
      //   },
      //   // JPEG 图片压缩配置
      //   mozjpeg: {
      //     quality: 60 // 压缩质量 0-100，值越小压缩率越高
      //   },
      //   // PNG 图片压缩配置(另一个压缩器)
      //   pngquant: {
      //     quality: [0.8, 0.9], // 压缩质量范围 0-1
      //     speed: 4 // 压缩速度 1-11，值越大压缩速度越快，但质量可能会下降
      //   },
      //   // SVG 图片压缩配置
      //   svgo: {
      //     plugins: [
      //       {
      //         name: 'removeViewBox' // 移除 viewBox 属性
      //       },
      //       {
      //         name: 'removeEmptyAttrs', // 移除空属性
      //         active: false // 是否启用此插件
      //       }
      //     ]
      //   }
      // })
    ],
    // 预加载项目必需的组件，vite会在启动时预先构建指定的依赖项，这些依赖项会被打包成单个文件，以减少模块解析和请求的开销
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@vueuse/core',
        'echarts',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        'vue-i18n',
        'element-plus/es/components/form/style/css',
        'element-plus/es/components/form-item/style/css',
        'element-plus/es/components/button/style/css',
        'element-plus/es/components/input/style/css',
        'element-plus/es/components/input-number/style/css',
        'element-plus/es/components/switch/style/css',
        'element-plus/es/components/upload/style/css',
        'element-plus/es/components/menu/style/css',
        'element-plus/es/components/col/style/css',
        'element-plus/es/components/icon/style/css',
        'element-plus/es/components/row/style/css',
        'element-plus/es/components/tag/style/css',
        'element-plus/es/components/dialog/style/css',
        'element-plus/es/components/loading/style/css',
        'element-plus/es/components/radio/style/css',
        'element-plus/es/components/radio-group/style/css',
        'element-plus/es/components/popover/style/css',
        'element-plus/es/components/scrollbar/style/css',
        'element-plus/es/components/tooltip/style/css',
        'element-plus/es/components/dropdown/style/css',
        'element-plus/es/components/dropdown-menu/style/css',
        'element-plus/es/components/dropdown-item/style/css',
        'element-plus/es/components/sub-menu/style/css',
        'element-plus/es/components/menu-item/style/css',
        'element-plus/es/components/divider/style/css',
        'element-plus/es/components/card/style/css',
        'element-plus/es/components/link/style/css',
        'element-plus/es/components/breadcrumb/style/css',
        'element-plus/es/components/breadcrumb-item/style/css',
        'element-plus/es/components/table/style/css',
        'element-plus/es/components/tree-select/style/css',
        'element-plus/es/components/table-column/style/css',
        'element-plus/es/components/select/style/css',
        'element-plus/es/components/option/style/css',
        'element-plus/es/components/pagination/style/css',
        'element-plus/es/components/tree/style/css',
        'element-plus/es/components/alert/style/css',
        'element-plus/es/components/radio-button/style/css',
        'element-plus/es/components/checkbox-group/style/css',
        'element-plus/es/components/checkbox/style/css',
        'element-plus/es/components/tabs/style/css',
        'element-plus/es/components/tab-pane/style/css',
        'element-plus/es/components/rate/style/css',
        'element-plus/es/components/date-picker/style/css',
        'element-plus/es/components/notification/style/css',
        'element-plus/es/components/image/style/css',
        'element-plus/es/components/statistic/style/css',
        'element-plus/es/components/watermark/style/css',
        'element-plus/es/components/config-provider/style/css',
        'element-plus/es/components/text/style/css',
        'element-plus/es/components/drawer/style/css',
        'element-plus/es/components/color-picker/style/css',
        'element-plus/es/components/backtop/style/css',
        'element-plus/es/components/message-box/style/css',
        'element-plus/es/components/skeleton/style/css',
        'element-plus/es/components/skeleton/style/css',
        'element-plus/es/components/skeleton-item/style/css',
        'element-plus/es/components/badge/style/css',
        'element-plus/es/components/steps/style/css',
        'element-plus/es/components/step/style/css',
        'element-plus/es/components/avatar/style/css',
        'element-plus/es/components/descriptions/style/css',
        'element-plus/es/components/descriptions-item/style/css',
        'element-plus/es/components/checkbox-group/style/css',
        'element-plus/es/components/progress/style/css',
        'element-plus/es/components/image-viewer/style/css',
        'element-plus/es/components/empty/style/css',
        'element-plus/es/components/segmented/style/css'
      ]
    },
    css: {
      preprocessorOptions: {
        // sass variable and mixin
        scss: {
          api: 'modern-compiler',
          additionalData: `
            @use "@styles/variables.scss" as *; @use "@styles/mixin.scss" as *;
          `
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  })
}

function resolvePath(paths) {
  return path.resolve(__dirname, paths)
}
