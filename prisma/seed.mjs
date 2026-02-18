import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) return;

  const product = await prisma.product.create({
    data: {
      slug: "classic-navy-suit",
      title: "Classic Navy Suit",
      description:
        "A timeless navy suit for weddings, office, and festive occasions. Choose your color and place a COD order.",
      basePricePaise: 799900,
      colors: {
        create: [
          { colorName: "Navy Blue", colorHex: "#0A2342", sortOrder: 1 },
          { colorName: "Charcoal", colorHex: "#2E2E2E", sortOrder: 2 },
          { colorName: "Black", colorHex: "#0B0B0B", sortOrder: 3 }
        ]
      }
    }
  });

  console.log("Seeded product:", product.title);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
