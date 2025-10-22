import type { MenuItem } from "@/packages/types/src/menu";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

export function MenuCard({ item }: { item: MenuItem }) {
  const soldOut = Boolean(item.soldOutUntil && new Date(item.soldOutUntil) > new Date());
  return (
    <article
      aria-label={item.name}
      style={{
        border: "1px solid #e5e7eb",
        padding: "1.25rem",
        borderRadius: "1rem",
        background: soldOut ? "#fef2f2" : "#ffffff",
        display: "grid",
        gap: "0.5rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{item.name}</h3>
        <p style={{ margin: 0, fontWeight: 600 }}>{formatCurrency(item.price)}</p>
      </div>
      {item.description ? <p style={{ margin: 0 }}>{item.description}</p> : null}
      <dl style={{ display: "flex", gap: "1.5rem", margin: 0, fontSize: "0.9rem" }}>
        {typeof item.calories === "number" ? (
          <div>
            <dt style={{ fontWeight: 600 }}>Calories</dt>
            <dd style={{ margin: 0 }}>{item.calories}</dd>
          </div>
        ) : null}
        {item.allergens.length ? (
          <div>
            <dt style={{ fontWeight: 600 }}>Allergens</dt>
            <dd style={{ margin: 0 }}>{item.allergens.join(", ")}</dd>
          </div>
        ) : null}
      </dl>
      {soldOut ? (
        <p style={{ margin: 0, color: "#b91c1c", fontWeight: 600 }}>
          Sold out until {new Date(item.soldOutUntil as string).toLocaleString()}
        </p>
      ) : null}
    </article>
  );
}
