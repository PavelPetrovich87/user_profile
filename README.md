# User Profile & Skill Graph Service

This project provides a backend service for managing a user's professional context and skill graph, exposed via a REST API and a Model Context Protocol (MCP) server.

## Features

- **Express Server**: RESTful API for CRUD operations on user context and skill progression.
- **SQLite Database**: Persistent storage for all profile data.
- **MCP Server**: Standards-based interface to interact with the profile using AI agents.
- **Auto-Seeding**: Initially populated with a comprehensive skill graph (Frontend, Backend, SRE, etc.).

## Components

- `server.js`: The Express API server (runs on port 3000).
- `mcp-server.js`: The MCP server (connects to the Express API).
- `database.db`: SQLite database file (created on first run).

## Installation

```bash
npm install
```

## Running the Project

### 1. Start the Express API
```bash
node server.js
```

### 2. Run the MCP Server
```bash
node mcp-server.js
```

## API Endpoints

- `GET /user-context`: Fetch user role and goals.
- `PUT /user-context`: Update user profile.
- `GET /skill-graph`: List all skills and mastery levels.
- `POST /skill-graph`: Add a new skill.
- `PUT /skill-graph/:id`: Update an existing skill.
- `DELETE /skill-graph/:id`: Remove a skill.

## MCP Tools

The MCP server exposes the following tools for use with compatible clients:
- `get_user_context`
- `update_user_context`
- `get_skill_graph`
- `add_skill`
- `update_skill`
- `delete_skill`
