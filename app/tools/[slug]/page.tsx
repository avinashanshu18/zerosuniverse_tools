import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, getRelatedTools, tools } from "@/lib/tools/registry";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { ToolPlaygroundRouter } from "@/components/tool/ToolPlaygrounds";

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
      canonical,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: canonical,
      siteName: "ZerosUniverse",
      type: "website",
    },
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

  return (
    <ToolPageShell tool={tool} relatedTools={relatedTools}>
      <ToolPlaygroundRouter tool={tool} />
    </ToolPageShell>
  );
}
