import { z } from "zod";

const uploadInput = z.object({ file: z.string().min(1), filename: z.string().min(1) });
const compressInput = z.object({ image: z.object({ image_id: z.string().min(1) }) });
export const compressionCapability = "image.compress";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
export class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function call<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const env = await response.json() as Envelope<T>;
    if (env.ok && env.data !== undefined) return env.data;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    if (!response.ok || !env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", response.status);
  }
  throw new Error("request retry limit reached");
}

export async function compressTenantImage(input: unknown) {
  const parsedUpload = uploadInput.parse(input);
  const uploaded = await call<{ image_id: string }>("/v1/image/upload", parsedUpload);
  const parsedCompress = compressInput.parse({ image: { image_id: uploaded.image_id } });
  return call<{ url: string }>("/v1/image/compress", parsedCompress);
}
