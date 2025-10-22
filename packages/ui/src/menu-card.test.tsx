import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MenuCard } from "./menu-card";
import type { MenuItem } from "@/packages/types/src/menu";

const baseItem: MenuItem = {
  id: "item-test",
  storeId: "store-demo",
  categoryId: "cat-demo",
  name: "Test Item",
  description: "Tasty test item",
  price: 10,
  calories: 200,
  allergens: ["nuts"],
  visible: true,
  soldOutUntil: null
};

describe("MenuCard", () => {
  it("renders item details", () => {
    render(<MenuCard item={baseItem} />);
    expect(screen.getByRole("article", { name: /test item/i })).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeVisible();
    expect(screen.getByText(/tasty test item/i)).toBeVisible();
    expect(screen.getByText("Calories")).toBeVisible();
    expect(screen.getByText("200")).toBeVisible();
  });

  it("shows sold out label when applicable", () => {
    render(<MenuCard item={{ ...baseItem, soldOutUntil: new Date(Date.now() + 3600_000).toISOString() }} />);
    expect(screen.getByText(/sold out until/i)).toBeVisible();
  });
});
