import Link from "next/link";

const links = [
  { href: "/guest", label: "Guest Menu" },
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/boards", label: "Boards" }
];

export default function LandingPage() {
  return (
    <main style={{ padding: "3rem", maxWidth: "960px", margin: "0 auto" }}>
      <header>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>MenuFlow</h1>
        <p style={{ fontSize: "1.125rem", maxWidth: "640px" }}>
          MenuFlow is an accessible digital menu platform backed by a versioned manifest so boards, guest devices, and internal
          teams stay in sync without touching a POS.
        </p>
      </header>
      <section aria-labelledby="explore">
        <h2 id="explore" style={{ marginTop: "2rem", fontSize: "1.5rem" }}>
          Explore the product surfaces
        </h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem", marginTop: "1rem" }}>
          {links.map((link) => (
            <li key={link.href} style={{ border: "1px solid #d1d5db", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <h3 style={{ margin: "0 0 0.5rem" }}>{link.label}</h3>
              <Link href={link.href} style={{ color: "#2563eb", fontWeight: 600 }}>
                Open {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
