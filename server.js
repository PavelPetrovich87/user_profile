const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const port = 3000;
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

app.use(express.json());

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS user_context (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    role TEXT,
    target_role TEXT,
    learning_goal TEXT,
    learning_schedule TEXT
  );

  CREATE TABLE IF NOT EXISTS skill_graph (
    id TEXT PRIMARY KEY,
    parent_id TEXT,
    name TEXT,
    type TEXT,
    mastery REAL,
    decay_rate REAL,
    last_touched TEXT,
    notes TEXT
  );
`);

// Seed Data
const initialUserContext = {
  role: "Senior Frontend Developer (10y Exp)",
  target_role: "SRE Architect / Product Engineer",
  learning_goal: "Build an Autonomous SRE Platform",
  learning_schedule: "8 hours/day, 6 days/week"
};

const initialSkillGraph = [
    { "id": "dom_fe", "name": "Frontend Domain", "type": "domain", "mastery": 0.95, "decay_rate": 0.1, "last_touched": "2025-12-29" },
    { "id": "fe_react", "parent_id": "dom_fe", "name": "React Core", "type": "technology", "mastery": 0.95, "last_touched": "2025-12-28" },
    { "id": "fe_react_hooks", "parent_id": "fe_react", "name": "Advanced Hooks", "type": "concept", "mastery": 0.90, "last_touched": "2025-12-28" },
    { "id": "fe_react_rsc", "parent_id": "fe_react", "name": "React Server Components", "type": "concept", "mastery": 0.40, "last_touched": "2025-10-01", "decay_rate": 1.2, "notes": "Need practical projects." },
    { "id": "fe_next_routing", "parent_id": "fe_react", "name": "Next.js App Router", "type": "concept", "mastery": 0.80, "last_touched": "2025-12-25" },
    { "id": "fe_state", "parent_id": "fe_react", "name": "Global State (Zustand/Redux)", "type": "concept", "mastery": 0.95, "last_touched": "2025-12-20" },
    { "id": "fe_perf", "parent_id": "dom_fe", "name": "Web Performance", "type": "concept", "mastery": 0.70, "last_touched": "2025-11-10" },
    { "id": "fe_vitals", "parent_id": "fe_perf", "name": "Core Web Vitals", "type": "concept", "mastery": 0.60, "last_touched": "2025-06-01" },
    { "id": "dom_be", "name": "Backend Domain", "type": "domain", "mastery": 0.65, "decay_rate": 0.5, "last_touched": "2025-12-25" },
    { "id": "be_node", "parent_id": "dom_be", "name": "Node.js Runtime", "type": "technology", "mastery": 0.75, "last_touched": "2025-12-25" },
    { "id": "be_node_eventloop", "parent_id": "be_node", "name": "Event Loop & Async", "type": "concept", "mastery": 0.80, "last_touched": "2025-12-25" },
    { "id": "be_node_streams", "parent_id": "be_node", "name": "Streams & Buffers", "type": "concept", "mastery": 0.40, "last_touched": "2024-01-01", "decay_rate": 1.5, "notes": "Critical for media streaming apps." },
    { "id": "be_python", "parent_id": "dom_be", "name": "Python", "type": "technology", "mastery": 0.30, "last_touched": "2025-12-01", "decay_rate": 1.0 },
    { "id": "be_py_async", "parent_id": "be_python", "name": "AsyncIO", "type": "concept", "mastery": 0.20, "last_touched": "2025-12-01" },
    { "id": "be_py_fastapi", "parent_id": "be_python", "name": "FastAPI", "type": "technology", "mastery": 0.30, "last_touched": "2025-12-01" },
    { "id": "dom_sre", "name": "SRE Domain", "type": "domain", "mastery": 0.30, "decay_rate": 0.8, "last_touched": "2025-01-01" },
    { "id": "sre_k8s", "parent_id": "dom_sre", "name": "Kubernetes", "type": "technology", "mastery": 0.15, "last_touched": "2025-01-01", "decay_rate": 1.5 },
    { "id": "sre_k8s_pods", "parent_id": "sre_k8s", "name": "Pods & Deployments", "type": "concept", "mastery": 0.20, "last_touched": "2025-01-01" },
    { "id": "sre_k8s_networking", "parent_id": "sre_k8s", "name": "Services & Ingress", "type": "concept", "mastery": 0.10, "last_touched": "2025-01-01" },
    { "id": "sre_k8s_storage", "parent_id": "sre_k8s", "name": "PV & PVC", "type": "concept", "mastery": 0.10, "last_touched": "2025-01-01" },
    { "id": "sre_net", "parent_id": "dom_sre", "name": "Networking", "type": "domain", "mastery": 0.40, "last_touched": "2025-01-01" },
    { "id": "sre_net_dns", "parent_id": "sre_net", "name": "DNS", "type": "concept", "mastery": 0.50, "last_touched": "2025-01-01" },
    { "id": "sre_net_lb", "parent_id": "sre_net", "name": "Load Balancing (L4 vs L7)", "type": "concept", "mastery": 0.30, "last_touched": "2025-01-01" },
    { "id": "sre_docker", "parent_id": "dom_sre", "name": "Docker Engine", "type": "technology", "mastery": 0.50, "last_touched": "2025-10-10", "decay_rate": 1.0 },
    { "id": "docker_builds", "parent_id": "sre_docker", "name": "Multi-Stage Builds", "type": "concept", "mastery": 0.40, "last_touched": "2025-10-10", "notes": "Optimizing image size (Alpine, Distroless)." },
    { "id": "docker_compose", "parent_id": "sre_docker", "name": "Docker Compose", "type": "tool", "mastery": 0.80, "last_touched": "2025-12-01" },
    { "id": "docker_net", "parent_id": "sre_docker", "name": "Docker Networking", "type": "concept", "mastery": 0.30, "last_touched": "2024-05-01", "decay_rate": 1.2, "notes": "Bridge vs Host vs Overlay networks." },
    { "id": "docker_security", "parent_id": "sre_docker", "name": "Container Security", "type": "concept", "mastery": 0.10, "last_touched": "2023-01-01", "notes": "Rootless containers, capabilities." },
    { "id": "sre_obs", "parent_id": "dom_sre", "name": "Observability", "type": "domain", "mastery": 0.20, "last_touched": "2025-01-01", "decay_rate": 0.8 },
    { "id": "obs_prom", "parent_id": "sre_obs", "name": "Prometheus", "type": "technology", "mastery": 0.15, "last_touched": "2025-01-01", "notes": "Scraping configs, PromQL." },
    { "id": "obs_grafana", "parent_id": "sre_obs", "name": "Grafana", "type": "tool", "mastery": 0.30, "last_touched": "2025-01-01", "notes": "Building dashboards from Prom data." },
    { "id": "obs_logs", "parent_id": "sre_obs", "name": "Structured Logging", "type": "concept", "mastery": 0.60, "last_touched": "2025-12-25", "notes": "JSON logs vs plain text." },
    { "id": "obs_loki", "parent_id": "sre_obs", "name": "Loki / ELK", "type": "technology", "mastery": 0.10, "last_touched": "2023-01-01" },
    { "id": "obs_trace", "parent_id": "sre_obs", "name": "Distributed Tracing", "type": "concept", "mastery": 0.05, "last_touched": "2023-01-01", "notes": "OpenTelemetry, tracking requests across microservices." },
    { "id": "dom_sd", "name": "System Design", "type": "domain", "mastery": 0.50, "last_touched": "2025-12-22" },
    { "id": "sd_dist", "parent_id": "dom_sd", "name": "Distributed Systems", "type": "concept", "mastery": 0.40, "last_touched": "2025-12-22" },
    { "id": "sd_cap", "parent_id": "sd_dist", "name": "CAP Theorem", "type": "concept", "mastery": 0.60, "last_touched": "2025-12-22" },
    { "id": "sd_db_sharding", "parent_id": "sd_dist", "name": "Database Sharding", "type": "concept", "mastery": 0.30, "last_touched": "2024-01-01" },
    { "id": "sd_caching", "parent_id": "sd_dist", "name": "Caching Strategies", "type": "concept", "mastery": 0.50, "last_touched": "2025-11-01", "notes": "Write-through vs Write-back." },
    { "id": "spec_media", "name": "Media Streaming", "type": "domain", "mastery": 0.10 },
    { "id": "spec_geo", "name": "Geolocation", "type": "domain", "mastery": 0.20 },
    { "id": "spec_auth", "name": "Auth & Security", "type": "domain", "mastery": 0.60 }
];

const seed = () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM user_context').get().count;
  if (userCount === 0) {
    db.prepare('INSERT INTO user_context (id, role, target_role, learning_goal, learning_schedule) VALUES (1, ?, ?, ?, ?)').run(
      initialUserContext.role,
      initialUserContext.target_role,
      initialUserContext.learning_goal,
      initialUserContext.learning_schedule
    );
  }

  const skillCount = db.prepare('SELECT COUNT(*) as count FROM skill_graph').get().count;
  if (skillCount === 0) {
    const insertSkill = db.prepare('INSERT INTO skill_graph (id, parent_id, name, type, mastery, decay_rate, last_touched, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const skill of initialSkillGraph) {
      insertSkill.run(
        skill.id,
        skill.parent_id || null,
        skill.name,
        skill.type,
        skill.mastery || 0,
        skill.decay_rate || 0,
        skill.last_touched || null,
        skill.notes || null
      );
    }
  }
};

seed();

// Routes
app.get('/user-context', (req, res) => {
  const user = db.prepare('SELECT * FROM user_context WHERE id = 1').get();
  res.json(user);
});

app.put('/user-context', (req, res) => {
  const { role, target_role, learning_goal, learning_schedule } = req.body;
  db.prepare('UPDATE user_context SET role = ?, target_role = ?, learning_goal = ?, learning_schedule = ? WHERE id = 1').run(
    role, target_role, learning_goal, learning_schedule
  );
  res.json({ message: 'User context updated successfully' });
});

app.get('/skill-graph', (req, res) => {
  const skills = db.prepare('SELECT * FROM skill_graph').all();
  res.json(skills);
});

app.post('/skill-graph', (req, res) => {
  const { id, parent_id, name, type, mastery, decay_rate, last_touched, notes } = req.body;
  db.prepare('INSERT INTO skill_graph (id, parent_id, name, type, mastery, decay_rate, last_touched, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, parent_id, name, type, mastery, decay_rate, last_touched, notes
  );
  res.status(201).json({ message: 'Skill added successfully' });
});

app.put('/skill-graph/:id', (req, res) => {
  const { id } = req.params;
  const { parent_id, name, type, mastery, decay_rate, last_touched, notes } = req.body;
  db.prepare('UPDATE skill_graph SET parent_id = ?, name = ?, type = ?, mastery = ?, decay_rate = ?, last_touched = ?, notes = ? WHERE id = ?').run(
    parent_id, name, type, mastery, decay_rate, last_touched, notes, id
  );
  res.json({ message: 'Skill updated successfully' });
});

app.delete('/skill-graph/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM skill_graph WHERE id = ?').run(id);
  res.json({ message: 'Skill deleted successfully' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
