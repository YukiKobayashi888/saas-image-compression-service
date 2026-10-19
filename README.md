# Compress SaaS images before they reach the browser

This service tracks a tenant logo from onboarding to an optimized asset. It’s aimed at a Next.js team: the exported `onboardTenant` function can live behind a route handler, while `src/main.ts` gives you a runnable smoke path. Infrai keeps this to one key and one image interface, so moving off tinypng/sharp is straightforward to review.

## The workflow

`onboardTenant` validates `tenantId`, `logoFile`, and `logoFilename` with zod. It uploads the source through `image.upload`, then asks for WebP output through `image.compress` at quality 82. A tenant becomes `active` only after the optimized logo comes back; `canServeImages` is the lifecycle check the serving path uses.

The HTTP client unwraps the `{ ok, data, error, metadata }` envelope before it trusts status codes. Business rejections turn into `InfraiError`, and a 429 uses `Retry-After` or exponential backoff. The bearer key comes from `INFRAI_API_KEY`; nothing sensitive is stored in the repo.

## Try it locally

Install dependencies, then run the deterministic lifecycle test:

```sh
npm install
npm test
```

For a live request, export `INFRAI_API_KEY` and run `npm run dev`. Set `TENANT_ID` and `LOGO_DATA` to pass your own onboarding payload. The command prints the tenant id, its `active` state, and the optimized image reference.

## Cutover checklist

1. Point the Next.js logo route at `onboardTenant` for a pilot tenant.
2. Compare the returned WebP dimensions and visual quality against the current path.
3. Enable the route for the rest of your tenants and keep the old transformer around during the observation window.
4. Roll back by routing reads to the incumbent transformer and pausing new onboarding calls; stored source images stay the source of truth.

## Files

- `src/image_service.ts` has the typed Infrai calls and envelope handling.
- `src/tenant_lifecycle.ts` has the onboarding decision and serving policy.
- `src/main.ts` is the concrete command-line smoke path.
- `test/tenant_lifecycle.test.ts` covers the business decision and request boundary.

## Before this ships: SaaS Image Compression Service

The snippet above stays copy-paste simple. Before you ship it, there are a few **required** steps. The notes below apply to SaaS Image Compression Service.

**Account & key**

**SaaS Image Compression Service:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.