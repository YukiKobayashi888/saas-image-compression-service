import { onboardTenant } from "./tenant_lifecycle.js";

const input = { tenantId: process.env.TENANT_ID ?? "acme", logoFile: process.env.LOGO_DATA ?? "base64-image-data", logoFilename: "acme-logo.png" };
try {
  const tenant = await onboardTenant(input);
  console.log(JSON.stringify({ tenantId: tenant.tenantId, state: tenant.state, optimizedLogo: tenant.optimizedLogo }));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
