# Open in Obsidian (VS Code extension)

Open Markdown files or registered Obsidian vaults directly from the VS Code Explorer.

## Commands

- **Open in Obsidian**: Right-click a `.md` file, use the editor context menu,
  click the status bar icon for an active Markdown file, or press `Ctrl+Alt+O`
  (`Cmd+Alt+O` on macOS). The note opens in its registered vault.
- **Open Vault in Obsidian**: Right-click a local folder in the Explorer.
  Obsidian opens the most specific registered vault containing that folder.

![Example](images/example.png)

## How vault detection works

The extension reads Obsidian's registered vaults from its application config:

- Windows: `%APPDATA%\obsidian\obsidian.json`
- macOS: `~/Library/Application Support/obsidian/obsidian.json`
- Linux: `${XDG_CONFIG_HOME:-~/.config}/obsidian/obsidian.json`

It chooses the most specific matching vault by comparing full directory paths
(case-insensitively on Windows) and opens it through Obsidian's URI protocol:

```text
obsidian://open?vault=<encoded-vault-id>
obsidian://open?vault=<encoded-vault-id>&file=<encoded-relative-path>
```

All parameters are URL-encoded. Nothing needs to be configured in the extension.
The extension uses `vscode.env.openExternal()` rather than a shell command.

**A folder must already have been registered as a vault in Obsidian.**
This extension does not create vaults or `.obsidian` directories. If a selected
folder belongs to no registered vault, VS Code displays a warning.

Selecting a subfolder opens the containing **vault**, not the subfolder as a
separate vault. If vaults are nested, the innermost registered vault wins.

The commands require local `file:` resources; remote/virtual files are not
supported by the current local-path registry matching.

## Development

```sh
pnpm install
pnpm test
pnpm run package
```

Install the resulting `.vsix` through VS Code's **Extensions → ... →
Install from VSIX**, then run **Developer: Reload Window** if an older
installed version is still loaded.

**Fork packaging note:** The manifest still uses the upstream Marketplace
publisher (`dndd`). To distribute an independently updated fork, first assign
your own publisher ID and ideally a distinct extension name, so that the
official extension does not conflict with your version. The existing publish
workflow is configured for the upstream publisher and should not be run
unchanged from a fork.
