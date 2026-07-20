export interface BlogLabel {
  name: string;
  tagClass: "pool" | "infra" | "personal" | "project";
}

const INFRASTRUCTURE: BlogLabel = {
  name: "Infrastruktur",
  tagClass: "infra",
};

const PERSONAL_BLOG: BlogLabel = {
  name: "Persönlicher Blog",
  tagClass: "personal",
};

const POOL_UPDATE: BlogLabel = {
  name: "Pool Update",
  tagClass: "pool",
};

const FINOPS: BlogLabel = {
  name: "FinOps",
  tagClass: "infra",
};

/**
 * Zentrale Label-Auflösung für das statische ForgePool-Frontend.
 *
 * Enthält:
 * - produktive IDs aus ForgePool Studio / Azure Table Storage
 * - lokale Seed-IDs für Entwicklung und Tests
 *
 * Neue Labels müssen künftig entweder hier ergänzt oder durch
 * den späteren Publishing-Prozess automatisch synchronisiert werden.
 */
const BLOG_LABELS: Readonly<Record<string, BlogLabel>> = {
  /*
   * Produktion
   */
  "e2edcb2e-13e2-44a8-b964-4161d1fb99f4": INFRASTRUCTURE,
  "24ea47e9-8250-4c90-801e-706377f03998": PERSONAL_BLOG,
  "cbc2e602-0497-4ec5-b16e-24449eea7eb1": POOL_UPDATE,
  "83b60ec7-44a5-42df-8601-da267d1ea40c": FINOPS,

  /*
   * Lokale ForgePool-Studio-Seeds
   */
  "22222222-2222-4222-8222-222222222222": INFRASTRUCTURE,
  "11111111-1111-4111-8111-111111111111": PERSONAL_BLOG,
  "33333333-3333-4333-8333-333333333333": POOL_UPDATE,
  "44444444-4444-4444-8444-444444444444": FINOPS,
};

const UNKNOWN_LABEL: BlogLabel = {
  name: "ForgePool",
  tagClass: "project",
};

export function getBlogLabel(labelId: string): BlogLabel {
  return BLOG_LABELS[labelId] ?? UNKNOWN_LABEL;
}