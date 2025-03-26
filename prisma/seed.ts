// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const categories = [
    {
      name: "Financial",
      description: "Fraud, bribery, embezzlement",
    },
    {
      name: "Administrative",
      description: "Misconduct in administration or abuse of authority",
    },
    {
      name: "Environmental",
      description: "Violations like pollution, illegal dumping",
    },
    {
      name: "Legal",
      description: "Irregularities in legal procedures or breaches of law",
    },
    {
      name: "Misconduct",
      description: "Workplace harassment, bullying, or similar issues",
    },
    {
      name: "Corruption",
      description: "General corruption cases that do not distinctly fit other categories",
    },
    {
      name: "Security",
      description: "Security breaches or data misuse",
    },
    {
      name: "Infrastructure",
      description: "Mismanagement of public infrastructure",
    },
    {
      name: "Other",
      description: "Any report that does not fit into the above categories",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log("Categories seeded.");
}

seed()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
