import { readMenu } from "@/lib/menu-store";

export const metadata = {
  title: "MenuFlow Boards"
};

export default async function BoardsPage() {
  const menu = await readMenu();
  const featured = menu.items.filter((item) => item.visible).slice(0, 4);
  const now = new Date();
  const soldOut = menu.items.filter((item) => item.soldOutUntil && new Date(item.soldOutUntil) > now);
  return (
    <main
      style={{
        background: "#0f172a",
        color: "#f8fafc",
        minHeight: "100vh",
        padding: "3rem",
        display: "grid",
        gap: "2rem"
      }}
    >
      <header>
        <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.9rem", color: "#38bdf8" }}>
          Live Board
        </p>
        <h1 style={{ fontSize: "3.5rem", margin: "0.5rem 0 0" }}>MenuFlow – Demo Bistro</h1>
        <p style={{ marginTop: "0.5rem", maxWidth: "720px" }}>
          This board renders directly from the shared MenuFlow manifest. Refresh to pick up the latest admin updates without
          editing a separate layout.
        </p>
      </header>
      <section aria-labelledby="board-menu" style={{ display: "grid", gap: "1.5rem" }}>
        <h2 id="board-menu" style={{ fontSize: "1.75rem", margin: 0 }}>Featured Now</h2>
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {featured.map((item) => (
            <article
              key={item.id}
              style={{
                background: "#1e293b",
                borderRadius: "1.5rem",
                padding: "1.5rem",
                display: "grid",
                gap: "0.75rem"
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.75rem" }}>{item.name}</h3>
              <p style={{ margin: 0, fontSize: "1rem", color: "#cbd5f5" }}>{item.description}</p>
              <p style={{ margin: 0, fontSize: "2rem", fontWeight: 600 }}>${item.price.toFixed(2)}</p>
              {item.soldOutUntil && new Date(item.soldOutUntil) > now ? (
                <p style={{ margin: 0, color: "#f87171", fontWeight: 600 }}>
                  Sold out until {new Date(item.soldOutUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      <footer>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>
          Manifest v{menu.version} · {soldOut.length ? `${soldOut.length} item(s) sold out` : "All items available"}
        </p>
      </footer>
    </main>
  );
}
