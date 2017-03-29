module.exports = anyconfig =>
  directory => {
    let eslintConfig = anyconfig.load({
      file: ".eslintrc",
      key: "eslint",
      directory: directory,
      defaultParser: "json,yaml"
    });

    let eslintIgnore = anyconfig.load({
      file: ".eslintignore",
      defaultParser: "text",
      directory: directory
    });

    if (eslintIgnore) {
      eslintConfig = eslintConfig || {};
      eslintConfig.ignore = eslintIgnore;
    }

    return eslintConfig;
  };
