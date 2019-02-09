# yamlenv

Yamlenv is a zero-dependency module that loads environment variables from a `env.yaml` file into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env). Storing configuration in the environment separate from code is based on [The Twelve-Factor App](http://12factor.net/config) methodology.

[![BuildStatus](https://travis-ci.com/stanislavt/yamlenv.svg?branch=master)](https://travis-ci.com/stanislavt/yamlenv)
[![NPM version](https://img.shields.io/npm/v/yamlenv.svg?style=flat-square)](https://www.npmjs.com/package/yamlenv)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![Coverage Status](https://img.shields.io/coveralls/stanislavt/yamlenv/master.svg?style=flat-square)](https://coveralls.io/github/stanislavt/yamlenv?branch=coverall-intergration)

## Install

```bash
# with npm
npm install yamlenv

# or with Yarn
yarn add yamlenv
```

## Usage

As early as possible in your application, require and configure yamlenv.

```javascript
require('yamlenv').config()
```

Create a `env.yaml` file in the root directory of your project. Add
environment-specific variables on new lines in the form of `NAME: VALUE`.
For example:

```dosini
DB_HOST: localhost
DB_USER: root
DB_PASS: s1mpl3
```

That's it.

`process.env` now has the keys and values you defined in your `env.yaml` file.

```javascript
const db = require('db')
db.connect({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS
})
```

### Preload

You can use the `--require` (`-r`) command line option to preload yamlenv. By doing this, you do not need to require and load yamlenv in your application code. This is the preferred approach when using `import` instead of `require`.

```bash
$ node -r yamlenv/config your_script.js
```

The configuration options below are supported as command line arguments in the format `yamlenv_config_<option>=value`

```bash
$ node -r yamlenv/config your_script.js yamlenv_config_path=/custom/path/to/your/env/vars
```

## Config

_Alias: `load`_

`config` will read your env.yaml file, parse the contents, assign it to
[`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env),
and return an Object with a `parsed` key containing the loaded content or an `error` key if it failed.  

```js
const result = yamlenv.config()

if (result.error) {
  throw result.error
}

console.log(result.parsed)
```

You can additionally, pass options to `config`.

### Options

#### Path

Default: `path.resolve(process.cwd(), 'env.yaml')`

You can specify a custom path if your file containing environment variables is
named or located differently.

```js
require('yamlenv').config({path: '/full/custom/path/to/your/env/vars'})
```

#### Encoding

Default: `utf8`

You may specify the encoding of your file containing environment variables
using this option.

```js
require('yamlenv').config({encoding: 'base64'})
```

## Parse

The engine which parses the contents of your file containing environment
variables is available to use. It accepts a String or Buffer and will return
an Object with the parsed keys and values.

```js
const yamlenv = require('yamlenv')
const buf = Buffer.from('BASIC: basic')
const config = yamlenv.parse(buf) // will return an object
console.log(typeof config, config) // object { BASIC : 'basic' }
```

### Rules

The parsing engine currently supports the following rules:

- `BASIC: basic` becomes `{BASIC: 'basic'}`
- empty lines are skipped
- lines beginning with `#` are treated as comments
- empty values become empty strings (`EMPTY: ` becomes `{EMPTY: ''}`)
- single and double quoted values are escaped (`SINGLE_QUOTE: 'quoted'` becomes `{SINGLE_QUOTE: "quoted"}`)
- new lines are expanded if in double quotes (`MULTILINE: "new\nline"` becomes

```
{MULTILINE: 'new
line'}
```
- inner quotes are maintained (think JSON) (`JSON: {"foo": "bar"}` becomes `{JSON:"{\"foo\": \"bar\"}"`)
- whitespace is removed from both ends of the value (see more on [`trim`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)) (`FOO: "  some value  "` becomes `{FOO: 'some value'}`)

## FAQ

### Should I commit my `env.yaml` file?

No. We **strongly** recommend against committing your `env.yaml` file to version
control. It should only include environment-specific values such as database
passwords or API keys. Your production database should have a different
password than your development database.

### Should I have multiple `env.yaml` files?

No. We **strongly** recommend against having a "main" `env.yaml` file and an "environment" `env.yaml` file like `env.test.yaml`. Your config should vary between deploys, and you should not be sharing values between environments.

> In a twelve-factor app, env vars are granular controls, each fully orthogonal to other env vars. They are never grouped together as “environments”, but instead are independently managed for each deploy. This is a model that scales up smoothly as the app naturally expands into more deploys over its lifetime.
>
> – [The Twelve-Factor App](http://12factor.net/config)

### What happens to environment variables that were already set?

We will never modify any environment variables that have already been set. In particular, if there is a variable in your `env.yaml` file which collides with one that already exists in your environment, then that variable will be skipped. This behavior allows you to override all `env.yaml` configurations with a machine-specific environment, although it is not recommended.

If you want to override `process.env` you can do something like this:

```javascript
const fs = require('fs')
const yamlenv = require('yamlenv')
const envConfig = yamlenv.parse(fs.readFileSync('.env.override'))
for (var k in envConfig) {
  process.env[k] = envConfig[k]
}
```

## License

See [LICENSE](LICENSE)

## Inspiration

[.env](https://github.com/motdotla/dotenv)
