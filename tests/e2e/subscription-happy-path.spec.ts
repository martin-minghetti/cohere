import { test, expect } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import postgres from "postgres";

loadEnv({ path: path.resolve(__dirname, "../../.env.local") });

const TEST_EMAIL_PREFIX = "e2e-test+";
const TEST_EMAIL_DOMAIN = "cohere.test";

function makeTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@${TEST_EMAIL_DOMAIN}`;
}

test.describe("Cohere subscription happy path", () => {
  const subscriberEmail = makeTestEmail();

  test.afterAll(async () => {
    const url = process.env.DATABASE_URL;
    if (!url) return;
    const sql = postgres(url, { max: 1 });
    try {
      await sql`DELETE FROM payment_events WHERE subscription_id IN (
        SELECT id FROM subscriptions WHERE subscriber_email LIKE ${TEST_EMAIL_PREFIX + "%@" + TEST_EMAIL_DOMAIN}
      )`;
      await sql`DELETE FROM subscriptions WHERE subscriber_email LIKE ${TEST_EMAIL_PREFIX + "%@" + TEST_EMAIL_DOMAIN}`;
    } finally {
      await sql.end();
    }
  });

  test("home → pro → plan → form → simulated authorize → portal active", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.locator('a[href="/p/ana-pilar"]').first().click();
    await expect(page).toHaveURL(/\/p\/ana-pilar$/);

    await page.locator('a[href="/p/ana-pilar/ilimitado/suscribirme"]').first().click();
    await expect(page).toHaveURL(/\/p\/ana-pilar\/ilimitado\/suscribirme$/);

    await page.locator("#subscriberName").fill("E2E Test Suscriptor");
    await page.locator("#subscriberEmail").fill(subscriberEmail);

    const submitBtn = page.getByRole("button", { name: /confirmar y pagar/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await page.waitForURL(/\/sub\/[a-f0-9-]+\/simulated-checkout/, {
      timeout: 30_000,
    });

    await expect(page.getByText(/autorizá tu suscripción/i)).toBeVisible();
    await expect(page.getByText(subscriberEmail).first()).toBeVisible();

    await page.getByRole("button", { name: /autorizar.*demo/i }).click();

    await page.waitForURL(/\/sub\/[a-f0-9-]+(\?t=[^/]+)?$/, { timeout: 30_000 });

    await expect(page.getByText(/activa/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /pausar/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /cancelar suscripción/i }),
    ).toBeVisible();
  });
});
