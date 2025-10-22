import { z } from "zod";
import { MenuSchema } from "@/packages/types/src/menu";

const ManifestResponseSchema = z.object({
  menu: MenuSchema,
  publishedAt: z.string().datetime()
});

export type ManifestResponse = z.infer<typeof ManifestResponseSchema>;

export class MenuFlowClient {
  constructor(private readonly baseUrl: string) {}

  async fetchManifest(signal?: AbortSignal): Promise<ManifestResponse> {
    const response = await fetch(new URL("/api/manifest", this.baseUrl), { signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status}`);
    }
    const data = await response.json();
    return ManifestResponseSchema.parse(data);
  }
}
