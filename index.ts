#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dbus from 'dbus-next';
import { execSync } from 'child_process';
import fs from 'fs';

// --- Debug Logging Utility ---
// Since stdout is used for MCP, we log to a file to debug the 20b model's slow handshake
const LOG_FILE = '/root/mcp-systemd/debug.log';
function log(msg: string) {
  fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
}

// 1. Initialize D-Bus connection to the System Bus
const bus = dbus.systemBus();

// 2. Create the MCP Server
const server = new Server(
  { name: "systemd-manager", version: "1.1.0" },
  { capabilities: { tools: {} } }
);

/**
 * TOOL DEFINITIONS
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log("Client requested tool list");
  return {
    tools: [
      {
        name: "get_service_state",
        description: "Get detailed ActiveState and SubState of a service.",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string", description: "Service name (e.g., 'sshd')" }
          },
          required: ["service"]
        }
      },
      {
        name: "list_failed_services",
        description: "List all systemd units currently in a 'failed' state.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_service_logs",
        description: "Fetch the last 20 lines of journalctl logs for a service.",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string", description: "Service name" }
          },
          required: ["service"]
        }
      },
      {
        name: "manage_service",
        description: "Start, stop, or restart a systemd service.",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string" },
            action: { type: "string", enum: ["start", "stop", "restart", "reload"] }
          },
          required: ["service", "action"]
        }
      }
    ]
  };
});

/**
 * TOOL HANDLERS
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  log(`Executing tool: ${name} with args: ${JSON.stringify(args)}`);

  try {
    const obj = await bus.getProxyObject('org.freedesktop.systemd1', '/org/freedesktop/systemd1');
    const manager = obj.getInterface('org.freedesktop.systemd1.Manager');

    switch (name) {
      case "get_service_state": {
        let srv = (args?.service as string).includes('.') ? args?.service : `${args?.service}.service`;
        const unitPath = await manager.GetUnit(srv);
        const unitObj = await bus.getProxyObject('org.freedesktop.systemd1', unitPath);
        const props = unitObj.getInterface('org.freedesktop.DBus.Properties');
        const active = await props.Get('org.freedesktop.systemd1.Unit', 'ActiveState');
        return { content: [{ type: "text", text: `Unit ${srv} is ${active.value}` }] };
      }

      case "list_failed_services": {
        const units = await manager.ListUnits();
        const failed = units
          .filter((u: any) => u[3] === 'failed')
          .map((u: any) => `${u[0]} (${u[1]})`)
          .join('\n');
        return { content: [{ type: "text", text: failed || "No failed services found." }] };
      }

      case "get_service_logs": {
        let srv = (args?.service as string).includes('.') ? args?.service : `${args?.service}.service`;
        const logs = execSync(`journalctl -u ${srv} -n 20 --no-pager`).toString();
        return { content: [{ type: "text", text: logs }] };
      }

      case "manage_service": {
        let srv = (args?.service as string).includes('.') ? args?.service : `${args?.service}.service`;
        const action = args?.action as string;
        let job;
        if (action === 'start') job = await manager.StartUnit(srv, 'replace');
        if (action === 'stop') job = await manager.StopUnit(srv, 'replace');
        if (action === 'restart') job = await manager.RestartUnit(srv, 'replace');
        if (action === 'reload') job = await manager.ReloadUnit(srv, 'replace');
        return { content: [{ type: "text", text: `Action ${action} sent for ${srv}. Job: ${job}` }] };
      }

      default:
        throw new Error("Tool not found");
    }
  } catch (error: any) {
    log(`Error: ${error.message}`);
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

// 5. Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("Server connected to StdioTransport");
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
