import { Suspense } from "react";
import { sampleMenu } from "@/packages/types/src/sample-data";
import { MenuCard } from "@/packages/ui/src/menu-card";

function MenuContent() {
  const sections = sampleMenu.categories;
  return (
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
            {sampleMenu.items
              .filter((item) => item.categoryId === category.id)
              .map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export const metadata = {
  title: "MenuFlow Guest Menu"
};

export default function GuestMenuPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#047857", fontWeight: 600 }}>In sync · Offline ready · WCAG 2.2 AA</p>
        <h1 style={{ fontSize: "2.25rem", margin: 0 }}>Today&apos;s Menu</h1>
        <p style={{ marginTop: "0.5rem", maxWidth: "640px" }}>
          Browse our live menu with nutritional insights and allergen highlights. Items update instantly when the kitchen makes
          changes.
        </p>
      </header>
      <Suspense fallback={<p>Loading menu…</p>}>
        <MenuContent />
      </Suspense>
    </main>
  );
}
