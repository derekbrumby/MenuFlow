import Link from "next/link";

const diagnostics = [
  {
    title: "Channel Sync",
    status: "3 channels in sync",
    detail: "Boards, guest web, and DoorDash are healthy."
  },
  {
    title: "Offline Resilience",
    status: "8h cache verified",
    detail: "Last resilience drill passed 2 hours ago."
  },
  {
    title: "Billing",
    status: "No anomalies",
    detail: "Fees are within 5% of forecast for the month."
  }
];

const quickActions = [
  { label: "86 Maple Oat Latte until 5pm", command: "86 maple oat latte until 5pm" },
  { label: "Set fries to $4.99", command: "set fries price to 4.99" },
  { label: "Show holiday menu tomorrow", command: "show holiday menu tomorrow" }
];

export const metadata = {
  title: "MenuFlow Admin Dashboard"
};

export default function AdminDashboard() {
  return (
    <main style={{ padding: "2.5rem", maxWidth: "1080px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#2563eb", fontWeight: 600 }}>Operator Workspace</p>
        <h1 style={{ fontSize: "2.25rem", margin: 0 }}>MenuFlow Control Center</h1>
        <p style={{ marginTop: "0.75rem", maxWidth: "720px" }}>
          Manage menus, monitor sync status, and keep every channel aligned. This dashboard surfaces the actions operators
          perform dozens of times per shift with shortcuts and clear diagnostics.
        </p>
      </header>

      <section aria-labelledby="quick-actions" style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 id="quick-actions" style={{ margin: 0, fontSize: "1.5rem" }}>
            Command Palette Shortcuts
          </h2>
          <Link href="#" aria-label="Open full command palette" style={{ color: "#2563eb", fontWeight: 600 }}>
            ⌘K
          </Link>
        </div>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
          {quickActions.map((action) => (
            <li
              key={action.command}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "0.75rem",
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>{action.label}</span>
              <code style={{ background: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: "0.5rem" }}>{action.command}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="diagnostics" style={{ marginBottom: "2.5rem" }}>
        <h2 id="diagnostics" style={{ fontSize: "1.5rem" }}>
          Live Diagnostics
        </h2>
        <div style={{ display: "grid", gap: "1rem", marginTop: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {diagnostics.map((item) => (
            <article key={item.title} style={{ border: "1px solid #d1d5db", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <h3 style={{ marginTop: 0 }}>{item.title}</h3>
              <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>{item.status}</p>
              <p style={{ margin: 0 }}>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="guidance">
        <h2 id="guidance" style={{ fontSize: "1.5rem" }}>Need help?</h2>
        <p style={{ maxWidth: "640px" }}>
          MenuFlow ships with embedded support and audit tooling. Hook up your Linear or Zendesk workspace and keep the
          escalation trail with full telemetry attached automatically.
        </p>
      </section>
    </main>
  );
}
