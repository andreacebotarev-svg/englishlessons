# Deployment Scripts

This directory contains deployment automation scripts for the project.

## Scripts

### `deploy.ps1`

Deploys changes from the `dist/` folder to GitHub Pages.

**Why `git add -f` is used:**

The `dist/` folder is listed in `.gitignore` to prevent accidental commits of build artifacts. However, in this project, `dist/` contains source files (HTML, CSS, JS) that **must** be in the repository for GitHub Pages deployment to work.

The `-f` (force) flag is necessary to override `.gitignore` for these specific files that need to be version controlled.

**Usage:**

```powershell
.\.scripts\deploy.ps1
```

**What it does:**

1. Checks if required files exist
2. Force-adds files from `dist/` using `git add -f`
3. Creates a commit with descriptive message
4. Pushes to `main` branch

**Alternative approaches:**

1. **Fix `.gitignore`**: Remove `dist/` from `.gitignore` and add specific ignore patterns for actual build artifacts
2. **GitHub Actions**: Use automated deployment workflow
3. **Separate branch**: Use `gh-pages` branch for deployment files

## Best Practices

- Scripts in this directory should be documented
- Scripts should check for file existence before operations
- Scripts should provide clear error messages
- Scripts should exit with appropriate error codes

