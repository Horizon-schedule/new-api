import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/rspack'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ envMode }) => {
  const env = loadEnv({ mode: envMode, prefixes: ['VITE_'] })
  /** 本地 API 地址（生产/集成开发均为 3000；仅手动 rsbuild dev 时代理用） */
  const apiServerUrl =
    process.env.VITE_REACT_APP_SERVER_URL ||
    env.rawPublicVars.VITE_REACT_APP_SERVER_URL ||
    'http://localhost:3000'

  const devServerPort = Number(
    process.env.VITE_DEV_SERVER_PORT ||
      env.rawPublicVars.VITE_DEV_SERVER_PORT ||
      3000
  )

  const isProd = envMode === 'production'
  const devProxy = Object.fromEntries(
    (['/api', '/mj', '/pg'] as const).map((key) => [
      key,
      {
        target: apiServerUrl,
        changeOrigin: true,
        onError: (
          err: NodeJS.ErrnoException,
          _req: unknown,
          res: {
            headersSent?: boolean
            writeHead: (code: number, headers: object) => void
            end: (body: string) => void
          }
        ) => {
          if (!isProd) {
            console.error(
              `[dev-proxy] ${key} -> ${apiServerUrl} failed (${err.code ?? err.message}). ` +
                'Use "bun run dev" for single-port :3000 (Go serves UI + API).'
            )
          }
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain' })
          }
          res.end('Bad Gateway')
        },
      },
    ]),
  )

  return {
    plugins: [pluginReact()],
    // Rsbuild 2: replaces deprecated `performance.chunkSplit` (RSPack 2 aligned)
    splitChunks: {
      preset: 'default',
      cacheGroups: {
        'vendor-react': {
          test: /node_modules[\\/](react|react-dom)[\\/]/,
          name: 'vendor-react',
          chunks: 'all',
          priority: 0,
          enforce: true,
        },
        'vendor-ui-primitives': {
          test: /node_modules[\\/](@base-ui|@radix-ui)[\\/]/,
          name: 'vendor-ui-primitives',
          chunks: 'all',
          priority: 0,
          enforce: true,
        },
        'vendor-tanstack': {
          test: /node_modules[\\/]@tanstack[\\/]/,
          name: 'vendor-tanstack',
          chunks: 'all',
          priority: 0,
          enforce: true,
        },
      },
    },
    source: {
      entry: {
        index: './src/main.tsx',
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    html: {
      template: './index.html',
    },
    server: {
      host: '0.0.0.0',
      port: isProd ? undefined : devServerPort,
      strictPort: !isProd,
      proxy: devProxy,
      printUrls: ({ urls }) => {
        if (!isProd) {
          // eslint-disable-next-line no-console
          console.log(
            `\n  Rsbuild: ${urls[0] ?? `http://localhost:${devServerPort}`}\n` +
              `  Recommended: bun run dev  →  http://localhost:3000 (Go only, one port)\n`
          )
        }
      },
    },
    output: {
      // Production optimizations
      minify: isProd,
      target: 'web',
      distPath: {
        root: 'dist',
      },
      // Rely on Rsbuild default legalComments ("linked" → per-chunk *.LICENSE.txt) in all modes.
      // Do not set "none" in production: that strips minifier-preserved third-party notices and
      // extracted license files, which some distributions require for open-source compliance.
    },
    performance: {
      preload: true,
      // Remove console in production
      removeConsole: isProd ? ['log'] : false,
      // Speed up repeated `rsbuild build` (local + CI when node_modules/.cache is preserved).
      // @see https://v2.rsbuild.dev/config/performance/build-cache
      buildCache: {
        cacheDigest: [process.env.VITE_REACT_APP_VERSION],
      },
    },
    tools: {
      rspack: {
        plugins: [
          tanstackRouter({
            target: 'react',
            // 开发与生产均按路由分包，避免 dev 单包过大导致首屏解析与 HMR 极慢
            autoCodeSplitting: true,
          }),
        ],
      },
    },
  }
})
