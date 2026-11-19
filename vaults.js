'use strict';

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

/**
 * Obsidian stores registered vaults in its application-level obsidian.json.
 * The directory is independent of individual vaults' .obsidian folders.
 */
function getRegistryPath({
  platform = process.platform,
  env = process.env,
  homeDir = os.homedir(),
} = {}) {
  if (platform === 'win32') {
    const appData = env.APPDATA || path.win32.join(homeDir, 'AppData', 'Roaming');
    return path.win32.join(appData, 'obsidian', 'obsidian.json');
  }

  if (platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Application Support', 'obsidian', 'obsidian.json');
  }

  const configHome = env.XDG_CONFIG_HOME && path.isAbsolute(env.XDG_CONFIG_HOME)
    ? env.XDG_CONFIG_HOME
    : path.join(homeDir, '.config');
  return path.join(configHome, 'obsidian', 'obsidian.json');
}

function parseRegistry(contents) {
  const registry = JSON.parse(contents);
  if (!registry || typeof registry !== 'object' ||
      !registry.vaults || typeof registry.vaults !== 'object' ||
      Array.isArray(registry.vaults)) {
    throw new Error('Invalid Obsidian vault registry: missing vaults object.');
  }
  return registry.vaults;
}

async function readRegisteredVaults(registryPath = getRegistryPath()) {
  return parseRegistry(await fs.readFile(registryPath, 'utf8'));
}

/**
 * Match whole directory segments (not just string prefixes), supporting
 * nested vaults and Windows' case-insensitive path rules.
 */
function findContainingVault(vaults, targetPath, platform = process.platform) {
  if (!vaults || typeof vaults !== 'object' || typeof targetPath !== 'string') {
    return null;
  }

  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const target = pathApi.resolve(targetPath);
  let best = null;

  for (const [id, vault] of Object.entries(vaults)) {
    if (!vault || typeof vault.path !== 'string' || !vault.path.trim()) {
      continue;
    }

    const root = pathApi.resolve(vault.path);
    const relative = pathApi.relative(root, target);
    if (relative === '..' || relative.startsWith('..' + pathApi.sep) ||
        pathApi.isAbsolute(relative)) {
      continue;
    }

    if (!best || root.length > best.root.length) {
      best = {
        id,
        root,
        relativePath: relative.split(pathApi.sep).join('/'),
      };
    }
  }

  return best;
}

function buildOpenUri(vaultId, relativeFilePath) {
  let uri = 'obsidian://open?vault=' + encodeURIComponent(vaultId);
  if (relativeFilePath) {
    uri += '&file=' + encodeURIComponent(relativeFilePath.replace(/\\/g, '/'));
  }
  return uri;
}

module.exports = {
  getRegistryPath,
  parseRegistry,
  readRegisteredVaults,
  findContainingVault,
  buildOpenUri,
};
