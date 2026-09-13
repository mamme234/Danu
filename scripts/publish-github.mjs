#!/usr/bin/env node
// Publish the project to a GitHub repository using the user's GITHUB_TOKEN.
// The token MUST be supplied at runtime via environment (never committed).

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

// Tokens and metadata are read directly from process.env so we never need to
// load a .env file or ship any dependency on a dotenv package.

const repo = process.env.GITHUB_REPOSITORY
const branch = process.env.GITHUB_BRANCH ?? 'main'
const token = process.env.GITHUB_TOKEN
const name = process.env.GITHUB_COMMITTER_NAME ?? 'DANU Releases'
const email = process.env.GITHUB_COMMITTER_EMAIL ?? 'releases@danuorthopaedic.example'

if (!repo || !token) {
  console.error('[publish-github] GITHUB_REPOSITORY and GITHUB_TOKEN must be configured before running.')
  process.exit(1)
}

const run = (cmd, args, env = {}) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } })
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`)))
})

async function main() {
  if (!existsSync('.git')) {
    await run('git', ['init'])
    await run('git', ['checkout', '-B', branch])
  }
  await run('git', ['config', 'user.name', name])
  await run('git', ['config', 'user.email', email])
  await run('git', ['add', '-A'])
  await run('git', ['commit', '-m', 'chore: publish DANU Orthopaedic Center platform', '--allow-empty'])
  const remote = `https://x-access-token:${token}@github.com/${repo}.git`
  await run('git', ['remote', 'remove', 'origin']).catch(() => {})
  await run('git', ['remote', 'add', 'origin', remote])
  await run('git', ['push', '-u', 'origin', branch, '--force-with-lease'])
  console.log('[publish-github] done.')
}

main().catch(err => {
  console.error('[publish-github] failed:', err)
  process.exit(1)
})
