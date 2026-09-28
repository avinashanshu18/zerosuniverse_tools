import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, getRelatedTools, tools } from "@/lib/tools/registry";
import type { Tool } from "@/lib/tools/types";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { ToolPlaygroundRouter } from "@/components/tool/ToolPlaygrounds";
import { FastWinCheatSheet } from "@/components/tool/FastWinCheatSheets";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const canonical = `https://www.zerosuniverse.com/tools/${tool.slug}/`;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: [tool.primaryKeyword, ...tool.secondaryKeywords],
    alternates: {
      canonical: `https://www.zerosuniverse.com/tools/${tool.slug}/`,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: `https://www.zerosuniverse.com/tools/${tool.slug}/`,
      siteName: "ZerosUniverse",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
  };
}

function buildSchema(tool: Tool) {
  const canonicalUrl = `https://www.zerosuniverse.com/tools/${tool.slug}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${canonicalUrl}#webapp`,
        name: tool.name,
        headline: tool.h1,
        description: tool.metaDescription,
        url: canonicalUrl,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All (Web Browser — Client-Side)",
        softwareVersion: "2026.1",
        isBasedOn: tool.pillarUrl,
        featureList: tool.features.map((f) => f.title),
        dateModified: tool.lastUpdated,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: {
          "@type": "Organization",
          name: "ZerosUniverse",
          url: "https://www.zerosuniverse.com/",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "ZerosUniverse",
            item: "https://www.zerosuniverse.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: "https://www.zerosuniverse.com/tools/",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool);
  const schema = buildSchema(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ToolPageShell tool={tool} relatedTools={relatedTools}>
        <ToolPlaygroundRouter tool={tool} />
        <FastWinCheatSheet tool={tool} />
      </ToolPageShell>
    </>
  );
}
