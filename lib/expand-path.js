const { join } = require('path')
const { homedir } = require('os')


function expandPath(p) {
  if (p === '~')
    return homedir()

  if (p.startsWith('~/'))
    return join(homedir(), p.slice(1))

  return p
}

module.exports = {
    expandPath
}