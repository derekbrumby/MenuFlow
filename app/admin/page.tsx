import { readMenu } from "@/lib/menu-store";
import type { Menu } from "@/packages/types/src/menu";
import { MenuManager } from "./menu-manager";

export const metadata = {
  title: "MenuFlow Admin Dashboard"
};

function computeDashboardInsights(menu: Menu) {
  const now = new Date();
  const soldOut = menu.items.filter((item) => item.soldOutUntil && new Date(item.soldOutUntil) > now);
  const hidden = menu.items.filter((item) => !item.visible);
  return {
    version: menu.version,
    soldOut,
    hidden
  };
}

export default async function AdminDashboard() {
  const menu = await readMenu();
  const insights = computeDashboardInsights(menu);

  return (
    <main style={{ padding: "2.5rem", maxWidth: "1100px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#2563eb", fontWeight: 600 }}>Operator Workspace</p>
        <h1 style={{ fontSize: "2.25rem", margin: 0 }}>MenuFlow Control Center</h1>
        <p style={{ marginTop: "0.75rem", maxWidth: "720px" }}>
          Adjust pricing, mark items as sold out, and track visibility in one place. The dashboard writes directly to the shared
          menu manifest so boards and guest experiences stay aligned.
        </p>
      </header>

      <section aria-labelledby="live-diagnostics" style={{ marginBottom: "2.5rem" }}>
        <h2 id="live-diagnostics" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Live Diagnostics
        </h2>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <article style={{ border: "1px solid #d1d5db", borderRadius: "0.75rem", padding: "1.25rem" }}>
            <h3 style={{ marginTop: 0 }}>Manifest Version</h3>
            <p style={{ margin: 0, fontWeight: 600 }}>v{insights.version}</p>
            <p style={{ margin: "0.5rem 0 0" }}>Every update increments the shared version to keep clients in sync.</p>
          </article>
          <article style={{ border: "1px solid #d1d5db", borderRadius: "0.75rem", padding: "1.25rem" }}>
            <h3 style={{ marginTop: 0 }}>Sold Out</h3>
            <p style={{ margin: 0, fontWeight: 600 }}>{insights.soldOut.length} items</p>
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1rem" }}>
              {insights.soldOut.length ? (
                insights.soldOut.map((item) => (
                  <li key={item.id}>
                    {item.name} until {new Date(item.soldOutUntil as string).toLocaleString()}
                  </li>
                ))
              ) : (
                <li>No active 86s</li>
              )}
            </ul>
          </article>
          <article style={{ border: "1px solid #d1d5db", borderRadius: "0.75rem", padding: "1.25rem" }}>
            <h3 style={{ marginTop: 0 }}>Hidden Items</h3>
            <p style={{ margin: 0, fontWeight: 600 }}>{insights.hidden.length}</p>
            <p style={{ margin: "0.5rem 0 0" }}>
              Hidden items remain in the manifest but are excluded from guest and board views until re-enabled.
            </p>
          </article>
        </div>
      </section>

      <MenuManager initialMenu={menu} />
    </main>
  );
}
