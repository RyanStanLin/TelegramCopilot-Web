import { expect, type Page, type Locator } from "@playwright/test";
export async function choose(
  scope: Page | Locator,
  page: Page,
  label: string,
  option: string,
  searchable = false,
) {
  const trigger = scope.getByRole("button", {
    name: new RegExp(`^${label}(?:\\s|$)`),
  });
  await trigger.click();
  if (searchable) {
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox").fill(option);
    await dialog.getByRole("option", { name: option, exact: true }).click();
  } else {
    await page
      .getByRole("menuitemradio", { name: option, exact: true })
      .click();
  }
  await expect(trigger).toHaveAccessibleName(new RegExp(option));
}
export async function changeLanguage(
  page: Page,
  language: "English" | "简体中文",
) {
  await page.getByRole("button", { name: /^(Language|语言):/ }).click();
  const option = page.getByRole("menuitemradio", {
    name: language,
    exact: true,
  });
  await expect(option).toContainText(language === "English" ? "🇬🇧" : "🇨🇳");
  await option.click();
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    language === "English" ? "en" : "zh-CN",
  );
}
