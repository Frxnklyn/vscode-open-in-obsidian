'use strict';

const vscode = require('vscode');
const {
  readRegisteredVaults,
  findContainingVault,
  buildOpenUri,
} = require('./vaults');

async function openFileInObsidian(targetUri) {
  if (!targetUri || targetUri.scheme !== 'file') {
    vscode.window.showErrorMessage('Select a local Markdown file to open in Obsidian.');
    return;
  }

  let vaults;
  try {
    vaults = await readRegisteredVaults();
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      vscode.window.showErrorMessage(
        'Obsidian vault registry not found. Open the folder as a vault in Obsidian first.'
      );
    } else {
      vscode.window.showErrorMessage(
        'Could not read Obsidian vaults: ' + (error.message || String(error))
      );
    }
    return;
  }

  const match = findContainingVault(vaults, targetUri.fsPath);
  if (!match) {
    vscode.window.showWarningMessage(
      'This path is not inside a registered Obsidian vault. Open it as a vault in Obsidian first.'
    );
    return;
  }

  const obsidianUri = buildOpenUri(match.id, match.relativePath);
  try {
    const opened = await vscode.env.openExternal(vscode.Uri.parse(obsidianUri));
    if (!opened) {
      vscode.window.showErrorMessage(
        'Could not launch Obsidian. Ensure it is installed and the obsidian:// protocol is registered.'
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      'Could not launch Obsidian: ' + (error.message || String(error))
    );
  }
}

function activate(context) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9999);
  statusBarItem.text = '$(sparkle-filled)';
  statusBarItem.color = '#7C3AED';
  statusBarItem.tooltip = 'Open in Obsidian';
  statusBarItem.command = 'openInObsidian.open';

  const updateStatusBarVisibility = (editor) => {
    if (editor?.document.languageId === 'markdown' && editor.document.uri.scheme === 'file') {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };

  updateStatusBarVisibility(vscode.window.activeTextEditor);
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarVisibility));

  context.subscriptions.push(
    vscode.commands.registerCommand('openInObsidian.open', (uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      return openFileInObsidian(targetUri);
    }),
    statusBarItem
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
