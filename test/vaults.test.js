'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getRegistryPath,
  parseRegistry,
  findContainingVault,
  buildOpenUri,
} = require('../vaults');

test('finds the most specific registered vault for a Windows Markdown file', () => {
  const vaults = {
    parent: { path: 'C:\\Work\\Project' },
    nested: { path: 'C:\\Work\\Project\\docs' },
  };
  const match = findContainingVault(
    vaults,
    'c:\\work\\PROJECT\\docs\\Notes\\My File.md',
    'win32'
  );

  assert.equal(match.id, 'nested');
  assert.equal(match.relativePath, 'Notes/My File.md');
});

test('opening a registered vault root has an empty relative path', () => {
  const match = findContainingVault(
    { myVault: { path: 'C:\\Work\\Project' } },
    'C:\\Work\\Project',
    'win32'
  );
  assert.equal(match.id, 'myVault');
  assert.equal(match.relativePath, '');
});

test('a sibling directory is not mistaken for a registered vault', () => {
  const match = findContainingVault(
    { myVault: { path: '/work/repo' } },
    '/work/repository/README.md',
    'linux'
  );
  assert.equal(match, null);
});

test('ignores entries without valid paths', () => {
  const match = findContainingVault(
    { bad: {}, invalid: { path: null }, valid: { path: '/work/repo' } },
    '/work/repo/docs',
    'linux'
  );
  assert.equal(match.id, 'valid');
  assert.equal(match.relativePath, 'docs');
});

test('returns null when a path belongs to no registered vault', () => {
  const match = findContainingVault(
    { myVault: { path: 'C:\\Vault' } },
    'C:\\Unrelated\\file.md',
    'win32'
  );
  assert.equal(match, null);
});

test('encodes vault IDs and vault-relative filenames safely', () => {
  assert.equal(
    buildOpenUri('id with spaces', 'folder\\über note.md'),
    'obsidian://open?vault=id%20with%20spaces&file=folder%2F%C3%BCber%20note.md'
  );
  assert.equal(buildOpenUri('abc'), 'obsidian://open?vault=abc');
});

test('parses Obsidian vault registry and rejects unsupported structures', () => {
  assert.deepEqual(
    parseRegistry('{"vaults":{"abc":{"path":"/notes"}}}'),
    { abc: { path: '/notes' } }
  );
  assert.throws(() => parseRegistry('{}'), /missing vaults object/);
  assert.throws(() => parseRegistry('{"vaults":[]}'), /missing vaults object/);
});

test('locates the Obsidian registry on Windows, macOS and Linux', () => {
  assert.equal(
    getRegistryPath({ platform: 'win32', env: { APPDATA: 'C:\\Users\\Me\\AppData\\Roaming' }, homeDir: 'C:\\Users\\Me' }),
    'C:\\Users\\Me\\AppData\\Roaming\\obsidian\\obsidian.json'
  );
  assert.equal(
    getRegistryPath({ platform: 'darwin', env: {}, homeDir: '/Users/me' }),
    '/Users/me/Library/Application Support/obsidian/obsidian.json'
  );
  assert.equal(
    getRegistryPath({ platform: 'linux', env: { XDG_CONFIG_HOME: '/custom/config' }, homeDir: '/home/me' }),
    '/custom/config/obsidian/obsidian.json'
  );
  assert.equal(
    getRegistryPath({ platform: 'linux', env: {}, homeDir: '/home/me' }),
    '/home/me/.config/obsidian/obsidian.json'
  );
});
