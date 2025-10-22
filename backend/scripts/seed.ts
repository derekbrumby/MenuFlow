import { PrismaClient } from "@prisma/client";
import { sampleMenu } from "@/packages/types/src/sample-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();
  await prisma.menuItem.deleteMany();

  await prisma.menu.create({
    data: {
      id: sampleMenu.id,
      storeId: sampleMenu.storeId,
      version: sampleMenu.version,
      categories: {
        create: sampleMenu.categories.map((category) => ({
          id: category.id,
          storeId: category.storeId,
          name: category.name,
          order: category.order,
          daypartRules: category.daypartRules
        }))
      },
      items: {
        create: sampleMenu.items.map((item) => ({
          id: item.id,
          storeId: item.storeId,
          categoryId: item.categoryId,
          name: item.name,
          description: item.description ?? "",
          price: item.price,
          calories: item.calories ?? 0,
          allergens: item.allergens,
          visible: item.visible,
          soldOutUntil: item.soldOutUntil
        }))
      }
    }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error("Seed failed", error);
    return prisma.$disconnect().finally(() => {
      process.exit(1);
    });
  });
