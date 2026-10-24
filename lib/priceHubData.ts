import prisma from "@/lib/prisma";
import { PriceHubArticle } from "@/lib/priceHubs";

const priceText = {
  contains: "price",
  mode: "insensitive" as const,
};

const pricingText = {
  contains: "pricing",
  mode: "insensitive" as const,
};

/** English articles whose slug, title, tags, or category mention a price. */
export async function loadPriceHubCandidates(): Promise<PriceHubArticle[]> {
  const rows = await prisma.article.findMany({
    where: {
      AND: [
        { NOT: { language: "hi" } },
        {
          OR: [
            { slug: priceText },
            { title: priceText },
            { tags: priceText },
            { category: priceText },
            { slug: pricingText },
            { title: pricingText },
            { tags: pricingText },
            { category: pricingText },
          ],
        },
      ],
    },
    select: {
      slug: true,
      title: true,
      tags: true,
      category: true,
      language: true,
      updatedAt: true,
      createdAt: true,
    },
  });
  return rows;
}
