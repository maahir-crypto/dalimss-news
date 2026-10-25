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

const productDesk = {
  OR: [
    { category: { contains: "Technology", mode: "insensitive" as const } },
    { category: { contains: "Automotive", mode: "insensitive" as const } },
  ],
};

/**
 * English articles that can belong on a price hub.
 * Comparisons and "Rs" launch headlines often never use the word price.
 * Local price news still has to be loaded so the matcher can leave it off.
 */
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
            {
              AND: [
                productDesk,
                {
                  OR: [
                    { slug: { contains: "-vs-", mode: "insensitive" } },
                    { title: { contains: " vs ", mode: "insensitive" } },
                    { tags: { contains: "comparison", mode: "insensitive" } },
                    { tags: { contains: "buying guide", mode: "insensitive" } },
                    { title: { contains: "should you buy", mode: "insensitive" } },
                    {
                      title: {
                        contains: "should you upgrade",
                        mode: "insensitive",
                      },
                    },
                    { tags: { contains: "should you buy", mode: "insensitive" } },
                    {
                      tags: {
                        contains: "should you upgrade",
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              ],
            },
            {
              AND: [
                productDesk,
                {
                  OR: [
                    { title: { contains: "Rs ", mode: "insensitive" } },
                    { title: { contains: "Rs.", mode: "insensitive" } },
                    { title: { contains: "₹" } },
                    { tags: { contains: "Rs ", mode: "insensitive" } },
                    { tags: { contains: "₹" } },
                  ],
                },
              ],
            },
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
