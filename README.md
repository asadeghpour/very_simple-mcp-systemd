# very_simple-mcp-systemd

Minimal MCP server using systemd.

## Run
```bash
npm install
./run-lab.sh
```

## Files
- index.ts / index.js – MCP server
- server_config.json – systemd config

# very_simple-mcp-systemd

> 🚀 Very simple MCP server with **npm install**, **systemd units**, and **GitHub template** support.

This repository is intended to be a **starting template** for building and deploying a minimal MCP server that:
- Installs via **npm**
- Runs as a **systemd service**
- Can be reused via **“Use this template”** on GitHub

---

## Features

- ✅ Minimal MCP server (Node.js / TypeScript)
- ✅ `npm install -g` support
- ✅ systemd service examples (system + user)
- ✅ Works on Linux servers
- ✅ GitHub template-ready

---

## Repository Structure

```text
very_simple-mcp-systemd/
├─ index.ts                  # MCP server entrypoint
├─ dist/                      # Compiled output
├─ systemd/
│  ├─ very-simple-mcp.service
│  └─ very-simple-mcp.user.service
├─ package.json
├─ tsconfig.json
├─ run-lab.sh
├─ README.md
└─ .github/
   └─ template.md

