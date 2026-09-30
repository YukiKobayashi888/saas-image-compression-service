import test from "node:test";
import assert from "node:assert/strict";
import { canServeImages, onboardingRequest } from "../src/tenant_lifecycle.js";

test("only active tenants may serve optimized images", () => {
  assert.equal(canServeImages("active"), true);
  assert.equal(canServeImages("pending"), false);
  assert.equal(canServeImages("suspended"), false);
});

test("onboarding boundary rejects an empty tenant id", () => {
  assert.throws(() => onboardingRequest.parse({ tenantId: "", logoFile: "x", logoFilename: "x.png" }));
});
