"use client";

import { useMemo, useState, useTransition } from "react";
import type { Menu, MenuCategory, MenuItem } from "@/packages/types/src/menu";

type MenuManagerProps = {
  initialMenu: Menu;
};

type MutationState = {
  itemId: string | null;
  message: string | null;
  error: string | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const availabilityLabel = (item: MenuItem) => {
  if (!item.soldOutUntil) return "Available";
  const until = new Date(item.soldOutUntil);
  if (Number.isNaN(until.getTime())) return "Available";
  if (until.getTime() < Date.now()) return "Available";
  return `Sold out until ${until.toLocaleString()}`;
};

async function patchJSON(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = typeof error?.error === "string" ? error.error : "Request failed";
    throw new Error(message);
  }
  return response.json();
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 0, 0);
  return copy;
}

export function MenuManager({ initialMenu }: MenuManagerProps) {
  const [menu, setMenu] = useState<Menu>(initialMenu);
  const [mutation, setMutation] = useState<MutationState>({ itemId: null, message: null, error: null });
  const [isPending, startTransition] = useTransition();

  const categories = useMemo(() => {
    const list = [...menu.categories];
    list.sort((a, b) => a.order - b.order);
    return list;
  }, [menu.categories]);

  const itemsByCategory = useMemo(() => {
    const grouped = new Map<MenuCategory["id"], MenuItem[]>();
    for (const category of categories) {
      grouped.set(category.id, []);
    }
    for (const item of menu.items) {
      const bucket = grouped.get(item.categoryId);
      if (bucket) {
        bucket.push(item);
      }
    }
    for (const [, list] of grouped) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return grouped;
  }, [categories, menu.items]);

  const runMutation = (itemId: string, message: string, task: () => Promise<Menu>) => {
    setMutation({ itemId, message: null, error: null });
    startTransition(() => {
      task()
        .then((nextMenu) => {
          setMenu(nextMenu);
          setMutation({ itemId, message, error: null });
        })
        .catch((error: Error) => {
          setMutation({ itemId, message: null, error: error.message });
        });
    });
  };

  const handlePriceUpdate = (item: MenuItem, form: HTMLFormElement) => {
    const formData = new FormData(form);
    const priceValue = Number(formData.get("price"));
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setMutation({ itemId: item.id, message: null, error: "Enter a valid price" });
      return;
    }
    runMutation(item.id, "Price updated", async () => {
      const data = await patchJSON(`/api/menu/items/${item.id}`, { price: priceValue });
      return data.menu as Menu;
    });
  };

  const handleSoldOut = (item: MenuItem, soldOutUntil: string | null, label: string) => {
    runMutation(item.id, label, async () => {
      const data = await patchJSON(`/api/menu/items/${item.id}/availability`, { soldOutUntil });
      return data.menu as Menu;
    });
  };

  const handleVisibilityToggle = (item: MenuItem) => {
    runMutation(item.id, item.visible ? "Item hidden" : "Item visible", async () => {
      const data = await patchJSON(`/api/menu/items/${item.id}`, { visible: !item.visible });
      return data.menu as Menu;
    });
  };

  return (
    <section aria-labelledby="menu-management">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 id="menu-management" style={{ margin: 0, fontSize: "1.5rem" }}>
          Menu Management
        </h2>
        <p style={{ margin: 0, fontSize: "0.95rem", color: "#4b5563" }}>
          Updates are persisted to <code>data/menu.json</code> and reflected instantly in guest and board surfaces.
        </p>
      </header>

      <div style={{ display: "grid", gap: "2rem" }}>
        {categories.map((category) => {
          const items = itemsByCategory.get(category.id) ?? [];
          return (
            <section key={category.id} aria-labelledby={`category-${category.id}`}>
              <h3 id={`category-${category.id}`} style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                {category.name}
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {items.map((item) => {
                  const isCurrentItem = mutation.itemId === item.id;
                  const itemIsSaving = isCurrentItem && isPending;
                  return (
                    <article
                      key={item.id}
                      aria-label={`${item.name} controls`}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "1rem",
                        padding: "1.25rem",
                        background: item.visible ? "#ffffff" : "#f3f4f6",
                        display: "grid",
                        gap: "0.75rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                        <div>
                          <h4 style={{ margin: 0 }}>{item.name}</h4>
                          <p style={{ margin: "0.25rem 0 0", color: "#4b5563" }}>{item.description}</p>
                          <p style={{ margin: "0.5rem 0 0", fontWeight: 600 }}>{formatCurrency(item.price)}</p>
                          <p style={{ margin: "0.25rem 0 0", color: "#047857", fontWeight: 500 }}>{availabilityLabel(item)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVisibilityToggle(item)}
                          style={{
                            border: "1px solid #d1d5db",
                            borderRadius: "999px",
                            padding: "0.5rem 1rem",
                            background: item.visible ? "#ffffff" : "#e5e7eb",
                            cursor: itemIsSaving ? "not-allowed" : "pointer",
                            opacity: itemIsSaving ? 0.6 : 1
                          }}
                          disabled={itemIsSaving}
                        >
                          {item.visible ? "Hide" : "Show"}
                        </button>
                      </div>

                      <form
                        key={`${item.id}-${item.price}`}
                        onSubmit={(event) => {
                          event.preventDefault();
                          handlePriceUpdate(item, event.currentTarget);
                        }}
                        style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}
                      >
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>Price</span>
                          <input
                            name="price"
                            defaultValue={item.price}
                            type="number"
                            step="0.01"
                            min="0"
                            style={{ border: "1px solid #d1d5db", borderRadius: "0.5rem", padding: "0.5rem", width: "6rem" }}
                            disabled={itemIsSaving}
                          />
                        </label>
                        <button
                          type="submit"
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 1rem",
                            cursor: itemIsSaving ? "not-allowed" : "pointer",
                            opacity: itemIsSaving ? 0.7 : 1
                          }}
                          disabled={itemIsSaving}
                        >
                          Update price
                        </button>
                      </form>

                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => handleSoldOut(item, new Date(Date.now() + 60 * 60 * 1000).toISOString(), "86 for 1 hour")}
                          style={{
                            border: "1px solid #b91c1c",
                            color: "#b91c1c",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 1rem",
                            background: "#fef2f2",
                            cursor: itemIsSaving ? "not-allowed" : "pointer",
                            opacity: itemIsSaving ? 0.7 : 1
                          }}
                          disabled={itemIsSaving}
                        >
                          86 · 1 hour
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSoldOut(
                              item,
                              endOfDay(new Date()).toISOString(),
                              "86 for today"
                            )
                          }
                          style={{
                            border: "1px solid #b91c1c",
                            color: "#b91c1c",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 1rem",
                            background: "#fef2f2",
                            cursor: itemIsSaving ? "not-allowed" : "pointer",
                            opacity: itemIsSaving ? 0.7 : 1
                          }}
                          disabled={itemIsSaving}
                        >
                          86 · Rest of day
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSoldOut(item, null, "86 cleared")}
                          style={{
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 1rem",
                            background: "#ffffff",
                            cursor: itemIsSaving ? "not-allowed" : "pointer",
                            opacity: itemIsSaving ? 0.6 : 1
                          }}
                          disabled={itemIsSaving}
                        >
                          Clear 86
                        </button>
                      </div>

                      {isCurrentItem ? (
                        <p role="status" style={{ margin: 0, color: mutation.error ? "#b91c1c" : "#047857", fontWeight: 500 }}>
                          {mutation.error ?? mutation.message ?? (itemIsSaving ? "Saving…" : null)}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
