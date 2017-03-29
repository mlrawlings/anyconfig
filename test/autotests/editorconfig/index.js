module.exports = anyconfig =>
  directory => {
    return anyconfig.load({
      file: ".editorconfig",
      key: "editor",
      defaultLoader: "ini",
      directory: directory
    });
  };
