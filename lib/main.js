const fs = require('fs')
const path = require('path')

/**
 * Parses a string or buffer into an object
 * @param {(string|Buffer)} src - source to be parsed
 * @returns {Object} keys and values from src
*/
function parse (src) {
  const obj = {}

  src.toString().split('\n').forEach(function (line) {
    const keyValueArr = line.match(/^\s*([\w.-]+)\s*:\s*(.*)?\s*$/)

    if (keyValueArr !== null) {
      const key = keyValueArr[1]
      let value = keyValueArr[2] || ''
      const len = value.length

      if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
        value = value.replace(/\\n/gm, '\n')
      }

      value = value.replace(/(^['"]|['"]$)/g, '').trim()

      obj[key] = value
    }
  })

  return obj
}

/**
 * Main entry point into yamlenv. Allows configuration before loading env.yaml
 * @param {Object} options - options for parsing env.yaml file
 * @param {string} [options.path=env.yaml] - path to env.yaml file
 * @param {string} [options.encoding=utf8] - encoding of .env file
 * @returns {Object} parsed object or error
*/
function config (options) {
  let yamlenvPath = path.resolve(process.cwd(), 'env.yaml')
  let encoding = 'utf8'

  if (options) {
    if (options.path) {
      yamlenvPath = options.path
    }
    if (options.encoding) {
      encoding = options.encoding
    }
  }

  try {
    const parsed = parse(fs.readFileSync(yamlenvPath, { encoding }))

    Object.keys(parsed).forEach(function (key) {
      if (!process.env.hasOwnProperty(key)) {
        process.env[key] = parsed[key]
      }
    })

    return { parsed }
  } catch (e) {
    return { error: e }
  }
}

module.exports.config = config
module.exports.load = config
module.exports.parse = parse
