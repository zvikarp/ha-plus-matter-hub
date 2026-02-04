import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { rimraf } from "rimraf";

const projectRoot = path.join(import.meta.dirname, "../..");

const frontend = packageDir("@ha-plus-matter-hub/frontend", "dist");
const backend = packageDir("@ha-plus-matter-hub/backend", "dist");
const common = packageDir("@ha-plus-matter-hub/common", "dist");
const commonPackageJson = packageDir("@ha-plus-matter-hub/common", "package.json");

const dist = path.resolve(import.meta.dirname, "dist");
await rimraf(dist);

fs.cpSync(frontend, path.join(dist, "frontend"), {
  recursive: true,
});
fs.cpSync(backend, path.join(dist, "backend"), {
  recursive: true,
});

// Bundle the common workspace package into node_modules
const commonNodeModulesPath = path.join(dist, "node_modules", "@ha-plus-matter-hub", "common");
fs.mkdirSync(commonNodeModulesPath, { recursive: true });
fs.cpSync(common, path.join(commonNodeModulesPath, "dist"), {
  recursive: true,
});
fs.cpSync(commonPackageJson, path.join(commonNodeModulesPath, "package.json"));

fs.cpSync(
  path.join(projectRoot, "README.md"),
  path.join(import.meta.dirname, "README.md"),
);
fs.cpSync(
  path.join(projectRoot, "LICENSE"),
  path.join(import.meta.dirname, "LICENSE"),
);

/**
 * Resolve a directory in a package
 * @param {string} packageName The path of the package json
 * @param {string} directory The dist dir in the package
 * @returns {string}
 */
function packageDir(packageName, directory) {
  const packageJsonPath = fileURLToPath(
    import.meta.resolve(path.join(packageName, "package.json")),
  );
  const packagePath = path.dirname(packageJsonPath);
  return path.join(packagePath, directory);
}
