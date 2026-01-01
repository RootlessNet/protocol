# How to Push to RootlessNet/protocol

You're getting permission denied because GitHub needs to verify you own the RootlessNet organization.

## Quick Fix - Use GitHub CLI (Recommended)

1. **Install GitHub CLI** (if not already installed):
   ```bash
   # On Arch Linux
   sudo pacman -S github-cli
   ```

2. **Authenticate with GitHub**:
   ```bash
   gh auth login
   ```
   - Select: GitHub.com
   - Select: HTTPS
   - Authenticate with your browser

3. **Push the code**:
   ```bash
   cd /home/aaryan/Projects/RootlessNet
   git push origin main
   ```

## Alternative - Use Personal Access Token

1. **Create a Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name: "RootlessNet Protocol"
   - Select scopes: `repo` (full control)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Use the token to push**:
   ```bash
   cd /home/aaryan/Projects/RootlessNet
   git remote set-url origin https://YOUR_TOKEN@github.com/RootlessNet/protocol.git
   git push origin main
   ```

## Alternative - Set up SSH Keys

1. **Generate SSH key**:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept default location
   # Enter a passphrase (or leave empty)
   ```

2. **Add SSH key to GitHub**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your public key
   - Click "Add SSH key"

3. **Test and push**:
   ```bash
   ssh -T git@github.com
   cd /home/aaryan/Projects/RootlessNet
   git remote set-url origin git@github.com:RootlessNet/protocol.git
   git push origin main
   ```

## Current Status

Your code is ready to push! All 31 tests are passing. Once you authenticate, run:

```bash
cd /home/aaryan/Projects/RootlessNet
git push origin main
```

The protocol implementation will then be live at:
https://github.com/RootlessNet/protocol
