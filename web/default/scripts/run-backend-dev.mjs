/**
 * Start Go backend on PORT=3001 so Rsbuild dev can use :3000.
 * Usage: bun run dev:backend  (from web/default)
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', '..')
const port = process.env.PORT || '3001'

const child = spawn('go', ['run', '.'], {
  cwd: repoRoot,
  env: { ...process.env, PORT: port },
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

child.on('exit', (code) => process.exit(code ?? 0))
