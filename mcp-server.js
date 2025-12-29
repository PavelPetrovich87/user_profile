const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const axios = require("axios");
const { z } = require("zod");
const { spawn } = require("child_process");
const path = require("path");

const API_BASE_URL = "http://localhost:3000";

const server = new Server(
  {
    name: "user-profile-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_user_context",
        description: "Get the user's current role, target role, and learning goals.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "update_user_context",
        description: "Update the user's role, target role, and learning goals.",
        inputSchema: {
          type: "object",
          properties: {
            role: { type: "string" },
            target_role: { type: "string" },
            learning_goal: { type: "string" },
            learning_schedule: { type: "string" },
          },
        },
      },
      {
        name: "get_skill_graph",
        description: "List all skills in the user's skill graph.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "add_skill",
        description: "Add a new skill to the skill graph.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            parent_id: { type: "string" },
            name: { type: "string" },
            type: { type: "string" },
            mastery: { type: "number" },
            decay_rate: { type: "number" },
            last_touched: { type: "string" },
            notes: { type: "string" },
          },
          required: ["id", "name", "type"],
        },
      },
      {
        name: "update_skill",
        description: "Update an existing skill in the skill graph.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
            parent_id: { type: "string" },
            name: { type: "string" },
            type: { type: "string" },
            mastery: { type: "number" },
            decay_rate: { type: "number" },
            last_touched: { type: "string" },
            notes: { type: "string" },
          },
          required: ["id"],
        },
      },
      {
        name: "delete_skill",
        description: "Delete a skill from the skill graph.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_user_context": {
        const response = await axios.get(`${API_BASE_URL}/user-context`);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "update_user_context": {
        const response = await axios.put(`${API_BASE_URL}/user-context`, args);
        return { content: [{ type: "text", text: response.data.message }] };
      }
      case "get_skill_graph": {
        const response = await axios.get(`${API_BASE_URL}/skill-graph`);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }
      case "add_skill": {
        const response = await axios.post(`${API_BASE_URL}/skill-graph`, args);
        return { content: [{ type: "text", text: response.data.message }] };
      }
      case "update_skill": {
        const response = await axios.put(`${API_BASE_URL}/skill-graph/${args.id}`, args);
        return { content: [{ type: "text", text: response.data.message }] };
      }
      case "delete_skill": {
        const response = await axios.delete(`${API_BASE_URL}/skill-graph/${args.id}`);
        return { content: [{ type: "text", text: response.data.message }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: error.response?.data?.message || error.message }],
    };
  }
});

let expressProcess;

async function startExpressServer() {
    return new Promise((resolve, reject) => {
        console.error("Starting Express server...");
        const serverPath = path.join(__dirname, "server.js");
        expressProcess = spawn("node", [serverPath], {
            stdio: ["ignore", "pipe", "inherit"],
        });

        // Redirect Express stdout to stderr to prevent MCP protocol corruption
        expressProcess.stdout.pipe(process.stderr);

        expressProcess.on("error", (err) => {
            console.error("Failed to start Express server:", err);
            reject(err);
        });

        expressProcess.on("exit", (code) => {
            if (code !== 0 && code !== null) {
                const err = new Error(`Express server exited with code ${code}`);
                console.error(err.message);
                reject(err);
            }
        });

        // Wait until the server is reachable
        let attempts = 0;
        const maxAttempts = 10;
        const poll = async () => {
            try {
                await axios.get(`${API_BASE_URL}/user-context`);
                console.error("Express server is ready.");
                resolve();
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    reject(new Error("Express server failed to become ready in time."));
                } else {
                    setTimeout(poll, 500);
                }
            }
        };
        poll();
    });
}

async function main() {
    await startExpressServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("User Profile MCP Server running on stdio");
}

// Cleanup on exit
const cleanup = () => {
    if (expressProcess) {
        console.error("Shutting down Express server...");
        expressProcess.kill();
    }
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

main().catch((error) => {
  console.error("Fatal error in main():", error);
    cleanup();
  process.exit(1);
});
