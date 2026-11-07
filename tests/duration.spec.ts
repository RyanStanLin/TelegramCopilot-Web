import { test, expect } from "@playwright/test";
import { formatDuration, parseDuration } from "../src/lib/duration";
import {
  formValues,
  settingsValues,
} from "../src/features/configuration/form-values";

for (const fixture of [
  { name: "seconds", seconds: 1, expected: "1s" },
  { name: "minute_boundary", seconds: 60, expected: "1分钟" },
  { name: "mixed_units", seconds: 9121, expected: "2小时32分1秒" },
  { name: "day_and_minute", seconds: 86460, expected: "1天1分" },
  { name: "fractional_second", seconds: 0.125, expected: "0.125s" },
  { name: "rounding_carries_to_minute", seconds: 59.9999, expected: "1分钟" },
])
  test(`duration_formats_${fixture.name}`, () =>
    expect(formatDuration(fixture.seconds)).toBe(fixture.expected));

test("duration_parser_accepts_chinese_english_and_numeric_units", () => {
  expect(parseDuration("1s")).toBe(1);
  expect(parseDuration("1分钟")).toBe(60);
  expect(parseDuration("2小时32分1秒")).toBe(9121);
  expect(parseDuration("2h 32m 1s")).toBe(9121);
  expect(parseDuration("120")).toBe(120);
  expect(formatDuration(9121, "en")).toBe("2h 32m 1s");
});
test("duration_parser_rejects_partial_negative_duplicate_and_reordered_units", () => {
  for (const value of [
    "",
    "-1s",
    "1.5s",
    "1m invalid",
    "1m1m",
    "1s2h",
    "1小时半",
    "9007199254740992s",
  ])
    expect(() => parseDuration(value)).toThrow("invalidDuration");
});
test("duration_forms_roundtrip_human_input_to_numeric_api_settings", () => {
  const fields = formValues("targets", {
    accountId: "fixture",
    identifier: "@alice",
    refreshSeconds: 60,
  });
  expect(fields.refreshSeconds).toBe("1m");
  expect(
    settingsValues("targets", { ...fields, refreshSeconds: "2分1秒" })
      .refreshSeconds,
  ).toBe(121);
  expect(formatDuration(null)).toBe("—");
  expect(formatDuration(-1)).toBe("—");
});
