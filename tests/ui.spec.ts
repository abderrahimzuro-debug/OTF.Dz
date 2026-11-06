import { expect, test } from "@playwright/test";

// These are review screenshots, not pixel-baseline regression tests.
for (const state of ["initial", "details"] as const) {
  test(`capture ${state} UI`, async ({ page }, testInfo) => {
    const browserErrors: string[] = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });

    await page.goto("/");
    await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("#app")).toHaveAttribute("data-runtime", "browser");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("runtime-mode")).toHaveText("معاينة المتصفح");
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    if (state === "details") {
      await page.getByRole("button", { name: "تفاصيل المعاينة" }).click();
      await expect(page.locator("#runtime-panel")).toBeVisible();
      await expect(page.locator("#runtime-result")).toContainText("تم تحميل الواجهة محليًا");
      await expect(page.locator("#runtime-details")).toHaveAttribute("aria-expanded", "true");
    } else {
      await expect(page.locator("#runtime-panel")).toBeHidden();
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(browserErrors).toEqual([]);

    const screenshotPath = testInfo.outputPath(`${testInfo.project.name}-${state}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      animations: "disabled",
      caret: "hide",
    });
    await testInfo.attach(`${testInfo.project.name}-${state}`, {
      path: screenshotPath,
      contentType: "image/png",
    });

    if (state === "details") {
      await page.locator("#runtime-details").click();
      await expect(page.locator("#runtime-panel")).toBeHidden();
      expect(browserErrors).toEqual([]);
    }
  });
}
