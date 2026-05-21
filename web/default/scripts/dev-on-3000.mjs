/**
 * 仅 3000 端口：构建前端后由 Go 提供页面 + API（与线上一致）
 * Usage: bun run dev  (from web/default) → http://localhost:3000
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const webDefault = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(webDefault, '..', '..')

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    })
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))
    )
  })
}

console.log('\n[dev:3000] Building frontend...\n')
await run('bun', ['run', 'build'], webDefault)

console.log('\n[dev:3000] Starting Go on http://localhost:3000\n')
const child = spawn('go', ['run', '.'], {
  cwd: repoRoot,
  env: { ...process.env, PORT: '3000' },
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

child.on('exit', (code) => process.exit(code ?? 0))
