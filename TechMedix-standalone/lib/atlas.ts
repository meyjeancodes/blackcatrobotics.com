// Atlas API wrapper — server-side only
// Use this in API routes and Server Components. Never import in client components.

import type {
  AtlasCompany,
  AtlasComponent,
  AtlasRelationship,
  AtlasSupplyChainGraph,
  AtlasCompanyProfile,
  AtlasQueryResult,
} from "../types/atlas";

const BASE_URL = process.env.ATLAS_BASE_URL ?? "https://api.humanoidatlas.com";
const API_KEY = process.env.ATLAS_API_KEY ?? "";

async function atlasGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`Atlas API error: ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function getCompanies(): Promise<AtlasCompany[]> {
  return atlasGet<AtlasCompany[]>("/companies");
}

export async function getCompany(id: string): Promise<AtlasCompanyProfile> {
  return atlasGet<AtlasCompanyProfile>(`/companies/${id}`);
}

export async function getComponents(): Promise<AtlasComponent[]> {
  return atlasGet<AtlasComponent[]>("/components");
}

export async function getRelationships(): Promise<AtlasRelationship[]> {
  return atlasGet<AtlasRelationship[]>("/relationships");
}

export async function getSupplyChain(companyId: string): Promise<AtlasSupplyChainGraph> {
  return atlasGet<AtlasSupplyChainGraph>(`/supply-chain/${companyId}`);
}

export async function queryAtlas(text: string): Promise<AtlasQueryResult> {
  return atlasGet<AtlasQueryResult>(`/query?q=${encodeURIComponent(text)}`);
}
