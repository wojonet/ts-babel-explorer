const fs = require("node:fs/promises");
const path = require("node:path");
const { transformFileAsync } = require("@babel/core");

const root = process.cwd();
const inputFile = path.resolve(root, "src", "demo", "input.ts");
const pluginFile = path.resolve(root, "dist", "plugin", "index.js");
const outputDir = path.resolve(root, "output");
const outputTs = path.resolve(outputDir, "output.ts");
const outputJs = path.resolve(outputDir, "output.js");

async function loadPluginFactory() {
  delete require.cache[require.resolve(pluginFile)];
  const pluginModule = require(pluginFile);
  return pluginModule.default || pluginModule;
}

async function transformWithPlugin(pluginFactory) {
  const common = {
    babelrc: false,
    configFile: false,
    filename: inputFile,
    plugins: [pluginFactory],
    parserOpts: {
      sourceType: "module",
      plugins: ["typescript"],
    },
  };

  const tsResult = await transformFileAsync(inputFile, common);
  const jsResult = await transformFileAsync(inputFile, {
    ...common,
    presets: [["@babel/preset-typescript", { allowDeclareFields: true }]],
  });

  if (!tsResult || !tsResult.code) {
    throw new Error("Babel did not generate TypeScript-preserved output.");
  }

  if (!jsResult || !jsResult.code) {
    throw new Error("Babel did not generate JavaScript output.");
  }

  return { tsCode: tsResult.code, jsCode: jsResult.code };
}

async function runTransform() {
  await fs.mkdir(outputDir, { recursive: true });

  const pluginFactory = await loadPluginFactory();
  const { tsCode, jsCode } = await transformWithPlugin(pluginFactory);

  await Promise.all([
    fs.writeFile(outputTs, tsCode, "utf8"),
    fs.writeFile(outputJs, jsCode, "utf8"),
  ]);

  return { outputTs, outputJs };
}

module.exports = { runTransform };

if (require.main === module) {
  runTransform()
    .then(({ outputTs: tsOut, outputJs: jsOut }) => {
      console.log(`Transform complete. Wrote:\n- ${tsOut}\n- ${jsOut}`);
    })
    .catch((error) => {
      console.error("Transform failed:");
      console.error(error);
      process.exitCode = 1;
    });
}
