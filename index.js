const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const properties = require("properties");
const tryRequire = require("try-require");

module.exports.load = load;

let createParser = parser => file => parser(fs.readFileSync(file, "utf-8"));

let loaders = {
  js: file => require(file),
  yaml: createParser(string => yaml.safeLoad(string)),
  json: createParser(string => JSON.parse(string)),
  properties: createParser(string => properties.parse(string)),
  ini: createParser(string =>
    properties.parse(string, {
      sections: true,
      comments: [";", "#"],
      separators: "=",
      strict: true
    })),
  text: createParser(string =>
    string.split(/\r\n|\n/).map(s => s.split("#")[0].trim()).filter(s => s))
};

loaders.yml = loaders.yaml;
loaders.txt = loaders.text;

const loaderNames = Object.keys(loaders).sort();
const loaderExtensions = loaderNames.map(name => {
  let ext = "." + name;
  loaders[ext] = loaders[name];
  return ext;
});

function load({ file, key, defaultLoader, defaultParser, directory }) {
  defaultLoader = typeof defaultParser === "function"
    ? createParser(defaultParser)
    : getDefaultLoader(defaultParser || defaultLoader);

  directory = directory || process.cwd();

  let config = loadConfig(file, directory, defaultLoader) ||
    loadConfig(key, path.join(directory, ".config")) ||
    loadConfig(key, path.join(directory, "config")) ||
    loadConfig(key, path.join(directory, ".meta")) ||
    loadConfig(key, path.join(directory, "meta"));

  if (!config) {
    let allConfig = loadConfig(".config", directory) ||
      loadConfig("config", directory) ||
      loadConfig(".meta", directory) ||
      loadConfig("meta", directory) ||
      tryRequire(path.join(directory, "package.json"));

    config = allConfig &&
      (allConfig[key + "Config"] ||
        allConfig[key + "config"] ||
        allConfig[key + "_config"] ||
        allConfig[key]);
  }

  return config;
}

function loadConfig(filePrefix, directory, defaultLoader) {
  let files = readDirCached(directory);
  let extensions = loaderExtensions;
  let loaderMatch;
  let fileMatch;

  if (!files) return;

  if (defaultLoader) {
    extensions = extensions.concat("");
  }

  extensions.some(ext => {
    return files.some(file => {
      if (file === filePrefix + ext) {
        fileMatch = path.join(directory, file);
        loaderMatch = loaders[ext] || defaultLoader;
        return true;
      }
    });
  });

  if (fileMatch) {
    try {
      return loaderMatch(fileMatch);
    } catch (e) {
      let error = Error(
        "Error loading config file " + fileMatch + "\n\n" + e.message
      );
      error.error = e;
      throw error;
    }
  }
}

let dircache = {};
function readDirCached(directory) {
  let cache = dircache[directory];
  if (cache !== undefined) return cache;

  try {
    return (dircache[directory] = fs.readdirSync(directory));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    dircache[directory] = null;
  }
}

function getDefaultLoader(option) {
  if (typeof option === "function") return option;
  if (option == null) return option;
  if (typeof option !== "string") {
    throw new TypeError(
      "The defaultLoader option for anyconfig must be a function " +
        "or the name of one of the built in loaders: " +
        parseNames.join(", ")
    );
  }

  let loaderList = option.split(",").map(name => {
    let loader = loaders[name];
    if (!loader) {
      throw new Error(
        "The defaultLoader option for anyconfig must match " +
          " the name of one of the built in loaders: " +
          parseNames.join(", ")
      );
    }
    return loader;
  });

  if (loaderList.length === 1) {
    return loaderList[0];
  }

  return (string) => {
    let errors = [];
    let result;

    loaderList.some(loader => {
      try {
        return (result = loader(string));
      } catch (error) {
        errors.push(error);
      }
    });

    if (!result) {
      let error = new Error(
        "Unable to load as " + options.split(",").join(" or ")
      );
      error.errors = errors;
      throw error;
    }

    return result;
  };
}
