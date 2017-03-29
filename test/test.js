const fs = require("fs");
const path = require("path");
const chai = require("chai");
const anyconfig = require("../");

const expect = chai.expect;
const getPath = (...args) => path.join(__dirname, ...args);
const filesInDir = (...args) => fs.readdirSync(getPath(...args));
const filterIndex = array => array.filter(file => file !== "index.js");
const groups = filesInDir("autotests");

groups.forEach(group => {
  describe(group, () => {
    const getConfig = require(getPath("autotests", group, "index.js"))(
      anyconfig
    );
    const tests = filterIndex(filesInDir("autotests", group));
    tests.forEach(test => {
      it(test, () => {
        const expectation = require(getPath(
          "autotests",
          group,
          test,
          "expected.js"
        ));
        const directory = getPath("autotests", group, test);
        const config = getConfig(directory);
        expect(config).to.eql(expectation);
      });
    });
  });
});
