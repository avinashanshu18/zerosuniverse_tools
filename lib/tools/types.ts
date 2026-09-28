export type ToolCategory =
  | "cybersecurity"
  | "android"
  | "apps"
  | "ai"
  | "tech";

export interface ToolFeature {
  title: string;
  description: string;
  icon: string;
}

export interface ToolUseCase {
  title: string;
  description: string;
}

export interface ToolHowToStep {
  name: string;
  text: string;
}

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  h1: string;
  subhead: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  features: ToolFeature[];
  useCases: ToolUseCase[];
  howTo: ToolHowToStep[];
  faq: ToolFaqItem[];
  related: string[];
  pillarUrl: string;
  pillarTitle: string;
  lastUpdated: string;
}
