# Installing very_simple-mcp-systemd on a Linux Server

This document explains how to install, configure, and run the
**very_simple-mcp-systemd** MCP server on a Linux system using **npm** and
**systemd**.

The guide provides two installation methods:
- **Option 1** – Install via npm (recommended for production)
- **Option 2** – Install from source (recommended for development or customization)

---

## Prerequisites

- Linux system with systemd
- Node.js 18 or newer
- npm
- Root or sudo access

Verify prerequisites:

node --version
npm --version
systemctl --version

---

## Option 1: Install via npm (Recommended for Production)

### Install globally
sudo npm install -g very-simple-mcp-systemd

This installs the executable:
very-simple-mcp

Test it:
very-simple-mcp
Stop with Ctrl+C.

---

## Option 2: Install from Source (Recommended for Development or Customization)

### Clone the repository
git clone https://github.com/asadeghpour/very_simple-mcp-systemd.git
cd very_simple-mcp-systemd

### Install dependencies
npm install

### Build the project
npm run build

The compiled server will be created at:
dist/index.js

### Run manually (test)
node dist/index.js
Stop with Ctrl+C.

---

## Create a Dedicated System User (Recommended)

sudo useradd -r -s /bin/false mcp
sudo mkdir -p /var/lib/very-simple-mcp
sudo chown mcp:mcp /var/lib/very-simple-mcp

---

## Install systemd Service (System-Wide)

sudo cp systemd/very-simple-mcp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now very-simple-mcp

---

## Verify Service Status

systemctl status very-simple-mcp
journalctl -u very-simple-mcp -f

---

## User-Level systemd Service (Optional)

mkdir -p ~/.config/systemd/user
cp systemd/very-simple-mcp.user.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now very-simple-mcp

---

## Configuration

The server can be configured using:
- server_config.json
- _modified_server_config.json

---

## Stopping and Removing the Service

sudo systemctl stop very-simple-mcp
sudo systemctl disable very-simple-mcp

---

## Uninstall

sudo npm uninstall -g very-simple-mcp-systemd
rm -rf very_simple-mcp-systemd

---

## Troubleshooting

- Check logs using journalctl
- Verify Node.js version compatibility
- Confirm permissions for /var/lib/very-simple-mcp
- Verify ExecStart path in systemd service file

---

## Summary

This setup provides:
- Two installation methods (npm or source)
- systemd-managed lifecycle
- Dedicated runtime user

The MCP server is ready for production or development use on Linux.
