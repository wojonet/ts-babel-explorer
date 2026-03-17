const chokidar = require("chokidar");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { runTransform } = require("./run-transform.cjs");

const root = process.cwd();
const watchTargets = [
  path.resolve(root, "src", "plugin", "index.ts"),
  path.resolve(root, "src", "demo", "input.ts"),
];

let running = false;
let rerunRequested = false;

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "build"], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
      shell: true,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Build exited with code ${code}.`));
      }
    });
  });
}

async function buildAndTransform(reason) {
  if (running) {
    rerunRequested = true;
    return;
  }

  running = true;
  console.log(
    `\n[dev] Change detected (${reason}). Building and transforming...`,
  );

  try {
    await runBuild();
    const outputs = await runTransform();
    console.log(`[dev] Success: ${outputs.outputTs}`);
    console.log(`[dev] Success: ${outputs.outputJs}`);
  } catch (error) {
    console.error("[dev] Failed:");
    console.error(error instanceof Error ? error.message : error);
  } finally {
    running = false;

    if (rerunRequested) {
      rerunRequested = false;
      await buildAndTransform("queued change");
    }
  }
}

console.log("[dev] Starting watch mode...");
console.log("[dev] Watching files:");
for (const target of watchTargets) {
  console.log(`- ${target}`);
}

buildAndTransform("startup").catch((error) => {
  console.error(error);
});

const watcher = chokidar.watch(watchTargets, {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 150,
    pollInterval: 50,
  },
});

watcher.on("change", (changedPath) => {
  const rel = path.relative(root, changedPath);
  buildAndTransform(rel).catch((error) => {
    console.error(error);
  });
});

watcher.on("error", (error) => {
  console.error("[dev] Watcher error:");
  console.error(error);
});
