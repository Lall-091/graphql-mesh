// ONLY run in Node SEA environments
// ONLY bundled for binary, see rollup.binary.config.js
// CANNOT be a part of the source code because importing
//        modules with node:sea is not supported

// @ts-check

const isDebug = ['1', 'y', 'yes', 't', 'true'].includes(String(process.env.DEBUG));
const shouldCleanPackedDeps = ['1', 'y', 'yes', 't', 'true'].includes(
  String(process.env.SEA_CLEAN_PACKED_DEPS),
);

/**
 * Will log only when DEBUG env is set to a truthy value.
 *
 * @param {string} msg
 * @param  {...unknown} args
 */
function debug(msg, ...args) {
  if (isDebug) {
    console.debug(`[${new Date().toISOString()}] SEA ${msg}`, ...args);
  }
}

// NOTE that the path is stable for modules hash and system,
// we should NEVER install modules in multiple places to avoid
// spamming user's devices
const seaPackedGetModulesPath = `${require('node:os').tmpdir()}/mesh-serve_${
  // @ts-expect-error INJECTED DURING BUNDLE (check rollup.binary.config.js)
  __MODULES_HASH__
}_node_modules`;

// used by packed modules
const seaPackedModulesRequire = require('node:module').createRequire(seaPackedGetModulesPath);

/** Intentionally IIFE, should run immediately on CLI boot. */
(function installSeaPackedDeps() {
  const ADMZip = require('adm-zip'); // THIS IS BUNDLED AND INJECTED

  const fs = require('node:fs');
  const Module = require('node:module');
  const path = require('node:path');
  const sea = require('node:sea');

  let packedDepsInstalled = fs.existsSync(seaPackedGetModulesPath);
  if (packedDepsInstalled) {
    debug(`Packed dependencies already installed at "${seaPackedGetModulesPath}"`);
    if (shouldCleanPackedDeps) {
      debug(`Removing existing packed dependencies`);
      fs.rmSync(seaPackedGetModulesPath, { recursive: true });
      packedDepsInstalled = false;
    }
  }
  if (!packedDepsInstalled) {
    debug(`Extracting packed dependencies to "${seaPackedGetModulesPath}"`);
    const zip = new ADMZip(Buffer.from(sea.getAsset('node_modules.zip')));
    zip.extractAllTo(seaPackedGetModulesPath);
  }

  debug('Registering packed dependencies');
  // @ts-expect-error
  const originalResolveFilename = Module._resolveFilename;
  // @ts-expect-error
  Module._resolveFilename = (...args) => {
    const [id, ...rest] = args;
    try {
      // always try to import from necessary modules first
      return originalResolveFilename(path.join(seaPackedGetModulesPath, id), ...rest);
    } catch {
      // fall back to the original resolver
      return originalResolveFilename(...args);
    }
  };
})();
