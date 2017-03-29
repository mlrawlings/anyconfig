# anyconfig

**a standard for consistent configuration across multiple languages/libraries/environments**

> **NEEDS DISCUSSION:** This is very much a work in progress  which I am coming from with node.js in mind as I develop the implementation alongside this standard.  Please open an issue with any questions, concerns or other feedback especially related to other languages and environments.

## TL;DR

anyconfig is both a standard and a companion library that can be easily used by any project.  

**Backwards compatible:**
anyconfig supports existing configuration files required by projects (`.eslintrc`, `.eslintignore` `webpack.config.js`, `Gruntfile.js`, `.editorconfig`, etc.)

**Consistent structure:**
Alternatively, anyconfig supports individual configuration files nested under a common directory (for example, `.config/eslint.json`) or in an aggregate file (for example, `config.yml`). Putting config keys in `package.json` is also supported.

**Consistent language:**
anyconfig supports a number of data formats (`json`, `yaml`, `js`, etc.) for any config file.

## We Have a Problem

_The number of config files per repo is slowly but surely overtaking the number of code files._ - [Kevin Suttle](http://kevinsuttle.com/posts/propelling-dx-through-config)

_I'm done with dotfiles for tutorials. They get lost in the unzipping process and cause too much grief for learners._ - [Wes Bos](https://twitter.com/wesbos/status/780403884263084032)

_There should be a better way to manage dotfiles for projects. There are just too many._ - [Travis Cunningham](https://twitter.com/std0ut/status/397825379705954304)

_My goal with open source is to put as many config files in your git repo as possible: .babelrc/.flowconfig/lerna.json/package.json/yarn.lock_ - [James Kyle](https://twitter.com/thejameskyle/status/788799662438227969)

_Y WE NO .config/manyfiles?_ - [Yehuda Katz](https://twitter.com/wycats/status/788836628085157888)

_All my projects with config use package.json_ - [Sindre Sorhus](https://twitter.com/sindresorhus/status/788835546080550912)

## Goals

The goal of this project is to create a standard for configurations that will achieve mass adoption across languages and environments.  This means it will need to be quite flexible and **meet existing projects where they are at**: `anyconfig` should be able to replace the existing config setup for a project without requiring users to change their current configuration.

## Targets
- Tooling config (editorconfig, eslint, babel, etc.)
- Library config
- Package config (Gemfile, package.json, etc.)
    - _(probably too ambitious)_

## Supported Formats

### Data formats

> **NEEDS DISCUSSION:** Many config setups that use json allow comments among other extensions to the json specification.  What should be covered here?  Are there other formats that should be supported?

- .json
- .yaml/.yml
- .properties
- .ini
- .txt/.text

### Programatic formats

Each language implementation may also implement additional formats specific to the language.  These should typically only be used for configuration for language specific tooling or libraries as other implementations will not be able to read them.

Users should also take into account that tools that write configuration will be limited writing to data files and as such will not be able to edit configuration generated programatically.

Example: node's `.js` format:

```js
module.exports = {
    // config goes here
}
```

## Search order

#### Proprietary files

If a project defines the `file` option, anyconfig will first look for this proprietary file with each of the supported data/programatic extensions, in alphabetical order.  

If none are found, anyconfig will also look for the `file` without an extension, provided the `defaultLoader` option is passed so that it knows how to load the file.

Example given `file: .eslintrc`

```
.eslintrc.coffee
.eslintrc.ini
.eslintrc.js
.eslintrc.json
.eslintrc.properties
.eslintrc.yaml
.eslintrc.yml
.eslintrc
```

### Nested directories

> **NEEDS DISCUSSION:** Having 4 potential names for the nested directory might not be the best idea ever.

If a proprietary file is not found or listed, anyconfig will then look at the `key` option and check the `.config/`, `config/`, `.meta/`, and `meta/` directories for a file named key with one of the supported data/programatic extensions.

Example given `key: eslint`

```
/.config/eslint.coffee
/.config/eslint.ini
/.config/eslint.js
...

/config/eslint.coffee
...

/.meta/eslint.coffee
...

/meta/eslint.coffee
...
```

### Aggregate files

> **NEEDS DISCUSSION:** Same here, maybe just pick one.

If no proprietary file or individual config file is found, then anyconfig will look for a aggregate config file named `.config`, `config`, `.meta`, or `meta` with one of the supported data/programatic extensions.

If found, anyconfig will look in the configuration object for a property matching `key+'Config'`, `key+'config'`, `key+'_config'` or `key`.

_Example:_
```
/.config.coffee
/.config.ini
/.config.js
...

/config.coffee
...

/.meta.coffee
...

/meta.coffee
...
```

### Special files

> **NEEDS DISCUSSION:** Is this a good idea and if so are there other files that should be supported?  Should these files be supported across all implementations or, for example, only the node implementation provide support for config in package.json?

Finally if no proprietary, individual, or aggregate config file is found, anyconfig will look for the following "special" files which will be treated as aggregate config files.

- `package.json`: this file is used by node.js and can contain package metadata. Many node projects already allow configuration to be embedded in this file ([eslint](http://eslint.org/docs/user-guide/configuring#configuration-file-formats), [babel](http://babeljs.io/docs/usage/babelrc/#use-via-package-json), [jest](https://facebook.github.io/jest/docs/configuration.html), etc.).

If found, anyconfig will look in the configuration object for a property matching `key+'Config'`, `key+'config'`, `key+'_config'` or `key`.

### API Example and resulting search order

Example ESLint in node:

```js
let eslintConfig = require('anyconfig').load({
    file: '.eslintrc',
    key: 'eslint',
    defaultParser: 'json,yaml'
});
```

```
.eslintrc.coffee
.eslintrc.ini
.eslintrc.js
.eslintrc.json
.eslintrc.properties
.eslintrc.yaml
.eslintrc.yml
.eslintrc

/.config/eslint.coffee
/.config/eslint.ini
/.config/eslint.js
/.config/eslint.json
/.config/eslint.properties
/.config/eslint.yaml
/.config/eslint.yml

/config/eslint.coffee
/config/eslint.ini
/config/eslint.js
/config/eslint.json
/config/eslint.properties
/config/eslint.yaml
/config/eslint.yml

/.meta/eslint.coffee
/.meta/eslint.ini
/.meta/eslint.js
/.meta/eslint.json
/.meta/eslint.properties
/.meta/eslint.yaml
/.meta/eslint.yml

/meta/eslint.coffee
/meta/eslint.ini
/meta/eslint.js
/meta/eslint.json
/meta/eslint.properties
/meta/eslint.yaml
/meta/eslint.yml

/.config.coffee
/.config.ini
/.config.js
/.config.json
/.config.properties
/.config.yaml
/.config.yml

/config.coffee
/config.ini
/config.js
/config.json
/config.properties
/config.yaml
/config.yml

/.meta.coffee
/.meta.ini
/.meta.js
/.meta.json
/.meta.properties
/.meta.yaml
/.meta.yml

/meta.coffee
/meta.ini
/meta.js
/meta.json
/meta.properties
/meta.yaml
/meta.yml

/package.json
```

## Hierarchical cascade

> **NOTE**: Not yet implemented

For some packages, it makes sense to allow configuration to cascade down the filesystem from the root directory to the current directory ([eslint](http://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy), [editorconfig](http://editorconfig.org/#file-location), etc.).

When cascading config files closest to the current directory have higher priority.  A config file at the root directory would have the lowest priority and a config file in the current directory would have the highest priority.

The `cascade` option can take one of the following values:

- **`false`**: (default) the config does not cascade
- **`overwrite`**: a higher priority
- **`shallow`**:
- **`deep`**: deep merge objects, arrays overwrite
- **`deep+concat`**: deep merge objects, arrays concat (`base.concat(current)`)
- **`(base, current) => ...`**: a function that is passed the base config (lower priority) and the current config (higher priority) and is expected to return the resulting config object

```
let eslintConfig = require('anyconfig').load({
    file: '.eslintrc',
    key: 'eslint',
    defaultParser: 'json,yaml',
    cascade: 'deep'
});
```

### Stopping the search

> **NEEDS DISCUSSION:** Both `eslint` and `editorconfig` provide a way to stop the search up the directory tree: a config file sets a `root:true` value.  When looking at multiple configurations, does it make sense to standardize on `root:true` or should this be configurable?  Would it make sense to allow `root:true` to be set as a top level config value in an aggregate config file so it impacts all cascades, or would there be reason that certain cascades should end at different points in the directory tree?

## Other considerations

> **NEEDS DISCUSSION:** These might be out of scope

- `dev`/`prod`/`staging` specific configs
    - [confit](https://www.npmjs.com/package/confit)
    - [config](https://www.npmjs.com/package/config)
    - [async-config](https://www.npmjs.com/package/async-config)
    - [web.config tranforms](https://www.codeproject.com/articles/1141716/web-config-transforms-a-beginners-guide)
- universal config extension: many config files enable you to extend another config, but not all do and they do so in different ways.
- directories: some configurations allow/require creating a directory specific to the project/tool and nest additional configuration files under that directory
- local config that does not get checked into the git repo, specific to your machine
- config validation
- writing configuration: some tools (such as package managers) allow you to update their config by running commands.  it would be important that the tool know where your config is and what format you want it in.