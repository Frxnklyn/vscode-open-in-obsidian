# Open in Obsidian (VS Code extension)

Opens Markdown files from VS Code in their registered Obsidian vault.

Right-click a `.md` file, use the editor context menu, click the status bar
button while a local Markdown file is active, or press `Ctrl+Alt+O`
(`Cmd+Alt+O` on macOS).

![Example](images/example.png)

## Reliable vault resolution

Instead of passing an absolute Windows path to `obsidian://open?path=`,
the extension locates the most specific registered vault and opens the file
using its vault ID and vault-relative path:

```text
obsidian://open?vault=<encoded-vault-id>&file=<encoded-relative-file-path>
```

Obsidian's `obsidian.json` registry is read from:

- Windows: `%APPDATA%\obsidian\obsidian.json`
- macOS: `~/Library/Application Support/obsidian/obsidian.json`
- Linux: `${XDG_CONFIG_HOME:-~/.config}/obsidian/obsidian.json`

The extension uses `vscode.env.openExternal()` to launch the URL.
It only supports local `file:` Markdown files in a vault already opened
in Obsidian at least once. It does not register new vaults or create a
`.obsidian` directory.

## Development

```sh
pnpm install
pnpm test
pnpm run package
```

Install the resulting `.vsix` via VS Code's **Install from VSIX** action.
To activate modified extension code, run **Developer: Reload Window**.

The manifest retains the upstream Marketplace publisher ID `dndd`.
For independently distributing a fork, change the extension ID/publisher
separately to avoid conflicts with official updates.
