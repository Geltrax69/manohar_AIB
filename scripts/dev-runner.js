const { spawn } = require('child_process')

const procs = []
let shuttingDown = false

function start(name, cmd, args) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: false
  })

  procs.push(child)

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    const reason = signal ? `signal ${signal}` : `code ${code}`
    console.error(`[dev-runner] ${name} exited with ${reason}`)
    shutdown(code || 1)
  })
}

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const proc of procs) {
    if (!proc.killed) proc.kill('SIGTERM')
  }
  setTimeout(() => process.exit(code), 200)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

start('backend', 'node', ['server/index.js'])
start('frontend', 'node', ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0', '--port', '3000'])
