module.exports = anyconfig =>
  directory => {
    return anyconfig.load({
      file: "webpack.config",
      key: "webpack",
      directory: directory
    });
  };
