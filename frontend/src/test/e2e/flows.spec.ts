import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function signIn(page: Page, role: "admin" | "receptionist" = "receptionist") {
  await page.goto("/login");
  await page.getByTestId("login-name").fill("E2E Reception");
  await page.getByTestId("login-role").selectOption(role);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/crm\/dashboard/);
}

test("Flow A: landing submit -> request success -> WhatsApp CTA", async ({ page }) => {
  await page.goto("/landing");
  await page.getByTestId("landing-full-name").fill("Flow A Patient");
  await page.getByTestId("landing-phone").fill("+923009991111");
  await page.getByTestId("landing-service").fill("General Consultation");
  await page.waitForTimeout(1400);
  await page.getByTestId("landing-submit").click();

  await expect(page).toHaveURL(/request-success/);
  await expect(page.getByText("Request received")).toBeVisible();
  await expect(page.getByTestId("whatsapp-continue-link")).toBeVisible();
});

test("Flow B: payment proof record -> verify", async ({ page }) => {
  await signIn(page, "admin");
  await page.goto("/crm/payments");
  await page.locator("select").first().selectOption({ index: 1 });
  await page.getByTestId("payment-record").click();
  await page.locator("[data-testid^='payment-verify-']").first().click();
  await expect(page.getByText("VERIFIED")).toBeVisible();
});

test("Flow B error path: payment proof rejection updates status and reason", async ({ page }) => {
  await signIn(page, "admin");
  await page.goto("/crm/payments");
  await page.locator("select").first().selectOption({ index: 1 });
  await page.getByTestId("payment-record").click();

  const firstRow = page.locator(".list-item").first();
  await firstRow.getByRole("button", { name: "Preview Proof" }).click();
  await firstRow.locator("select").selectOption("Amount mismatch");
  await firstRow.locator("[data-testid^='payment-reject-']").click();

  await expect(firstRow.getByText("REJECTED")).toBeVisible();
  await expect(firstRow.getByText("Reason: Amount mismatch")).toBeVisible();
});

test("Flow C: add-on billing controls + payment gate block", async ({ page }) => {
  await signIn(page);
  await page.goto("/crm/invoices");

  const proceedButton = page.getByRole("button", { name: "Proceed To Test" }).first();
  await expect(proceedButton).toBeDisabled();
  await expect(page.getByText("Payment is not fully verified. Verify payment before proceeding to test.")).toBeVisible();

  await page.getByRole("button", { name: "Supplemental Invoice" }).first().click();
  await page.getByRole("button", { name: "Add-On Test Billing" }).first().click();
  await expect(page.getByText("Supplemental invoice")).toBeVisible();
});

test("Error path: anti-spam minimum submit delay", async ({ page }) => {
  await page.goto("/landing");
  await page.getByTestId("landing-full-name").fill("Fast Submit");
  await page.getByTestId("landing-phone").fill("+923001231231");
  await page.getByTestId("landing-service").fill("General Consultation");
  await page.getByTestId("landing-submit").click();
  await expect(page.getByText("Please review details and submit again.")).toBeVisible();
});

test("Error path: payment rejection is blocked until reason is selected", async ({ page }) => {
  await signIn(page, "admin");
  await page.goto("/crm/payments");
  await page.locator("select").first().selectOption({ index: 1 });
  await page.getByTestId("payment-record").click();

  const firstRow = page.locator(".list-item").first();
  await firstRow.getByRole("button", { name: "Preview Proof" }).click();
  await firstRow.locator("[data-testid^='payment-reject-']").click();

  await expect(firstRow.getByText("RECEIVED")).toBeVisible();
  await expect(firstRow.getByText(/^Reason:/)).toHaveCount(0);
});

test("Role restriction: receptionist cannot verify or reject payments", async ({ page }) => {
  await signIn(page, "admin");
  await page.goto("/crm/invoices");
  await page.getByTestId("create-invoice-button").click();
  await page.goto("/crm/payments");
  await page.locator("select").first().selectOption({ index: 1 });
  await page.getByTestId("payment-record").click();
  await expect(page.locator("[data-testid^='payment-verify-']").first()).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();

  await signIn(page, "receptionist");
  await page.goto("/crm/payments");
  await expect(page.getByText("Verification actions are restricted to admin role.")).toBeVisible();
  const verifyButtons = page.locator("[data-testid^='payment-verify-']");
  const verifyButtonCount = await verifyButtons.count();
  if (verifyButtonCount > 0) {
    await expect(verifyButtons.first()).toBeDisabled();
    await page.locator(".list-item").first().getByRole("button", { name: "Preview Proof" }).click();
    await expect(page.locator("[data-testid^='payment-reject-']").first()).toBeDisabled();
  }
});

test("Audit trail page renders immutable event feed", async ({ page }) => {
  await signIn(page, "receptionist");
  await page.goto("/crm/audit");
  await expect(page.getByText("Immutable Audit Trail")).toBeVisible();
  await expect(page.getByText("Read-only event feed")).toBeVisible();
  await expect(page.getByTestId("audit-event-row").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
});
