import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function signInForA11y(basePage: Page) {
  await basePage.goto("/login");
  await basePage.getByTestId("login-name").fill("A11y User");
  await basePage.getByTestId("login-submit").click();
  await expect(basePage).toHaveURL(/\/crm\/dashboard/);
}

function criticalViolations(violations: Array<{ impact?: string | null }>) {
  return violations.filter((violation) => violation.impact === "critical");
}

test("Accessibility baseline: login page has no critical axe violations", async ({ page }) => {
  await page.goto("/login");
  const scan = await new AxeBuilder({ page }).analyze();
  expect(criticalViolations(scan.violations)).toEqual([]);
});

test("Accessibility baseline: crm shell pages have no critical axe violations", async ({ page }) => {
  await signInForA11y(page);

  const dashboardScan = await new AxeBuilder({ page }).analyze();
  expect(criticalViolations(dashboardScan.violations)).toEqual([]);

  await page.goto("/crm/requests");
  const requestsScan = await new AxeBuilder({ page }).analyze();
  expect(criticalViolations(requestsScan.violations)).toEqual([]);
});
