import { z } from "zod";
import { compressTenantImage } from "./image_service.js";

export const onboardingRequest = z.object({ tenantId: z.string().min(1), logoFile: z.string().min(1), logoFilename: z.string().min(1) });
export type TenantState = "pending" | "active" | "suspended";

export async function onboardTenant(input: unknown) {
  const request = onboardingRequest.parse(input);
  const result = await compressTenantImage({ file: request.logoFile, filename: request.logoFilename });
  return { tenantId: request.tenantId, state: "active" as TenantState, optimizedLogo: result.url };
}

export function canServeImages(state: TenantState) { return state === "active"; }
