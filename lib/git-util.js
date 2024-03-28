const { exec: _exec } = require('child_process')
const { expandPath } = require('./expand-path')

function createGitUtil(workdir) {
  const cwd = expandPath(workdir)

  // => Promise(stdout: string)
  function exec(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      console.log(`    exec: ${cmd}`)

      // TEST ONLY
      // if (cmd.startsWith('gclient') || cmd.startsWith('autoninja') || cmd.startsWith('out')) {
      //   return resolve('')
      // }

      _exec(
        cmd,
        { cwd, maxBuffer: 16 * 1024 * 1024, encoding: 'utf-8', ...opts },
        (err, stdout, stderr) => {
          const elapsedTime = Date.now() - startTime
          console.log(`          ${elapsedTime / 1000} seconds`)
          if (err)
            return reject(err)

          resolve(stdout)
        })
    })
  }

  // => Promise( [{ hash: string, subject: string }] )
  function revisionList(from = 'HEAD~100', to = 'HEAD') {
    return exec(`git log --pretty='format:%H%x09%s' ${from}..${to}`).then(
      rawList => rawList
        .split(/[\n\r]+/g)
        .filter($ => $.trim())
        .map(line => line.split('\x09'))
        .map(([hash, subject]) => ({ hash, subject }))
    )
  }

  // => Promise
  function checkout(ref) {
    return exec(`git checkout -f ${ref}`)
  }

  // => Promise
  function gclientSync() {
    return exec(`gclient sync`)
  }

  return {
    revisionList,
    checkout,
    gclientSync,
    exec,
  }
}

module.exports = {
  create: createGitUtil
}