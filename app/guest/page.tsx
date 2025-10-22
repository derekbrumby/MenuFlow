import { readMenu } from "@/lib/menu-store";
import { MenuCard } from "@/packages/ui/src/menu-card";

export const metadata = {
  title: "MenuFlow Guest Menu"
};

export default async function GuestMenuPage() {
  const menu = await readMenu();
  const sections = [...menu.categories].sort((a, b) => a.order - b.order);

  return (
    <main style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#047857", fontWeight: 600 }}>In sync · Backed by shared manifest · WCAG 2.2 AA</p>
        <h1 style={{ fontSize: "2.25rem", margin: 0 }}>Today&apos;s Menu</h1>
        <p style={{ marginTop: "0.5rem", maxWidth: "640px" }}>
          Browse the live menu backed by the same manifest that powers boards and kiosks. Nutrition and allergen details stay in
          sync with every admin update.
        </p>
      </header>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {sections.map((category) => (
          <section key={category.id} aria-labelledby={`category-${category.id}`}>
            <header>
              <h2
                id={`category-${category.id}`}
                style={{ fontSize: "1.75rem", marginBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}
              >
                {category.name}
              </h2>
            </header>
            <div style={{ display: "grid", gap: "1rem" }}>
              {menu.items
                .filter((item) => item.categoryId === category.id)
                .filter((item) => item.visible)
                .map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
