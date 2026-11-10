"use client";
import { createContext, useContext, useEffect, useState } from "react";
import en from "./en/common.json";
import zh from "./zh-CN/common.json";
import fieldsEn from "./en/fields.json";
import fieldsZh from "./zh-CN/fields.json";
import experienceEn from "./en/experience.json";
import experienceZh from "./zh-CN/experience.json";
import authenticationEn from "./en/authentication.json";
import authenticationZh from "./zh-CN/authentication.json";
import activityEn from "./en/activity.json";
import activityZh from "./zh-CN/activity.json";
const dictionaries = {
  en: { ...en, ...fieldsEn, ...experienceEn, ...authenticationEn, ...activityEn },
  "zh-CN": { ...zh, ...fieldsZh, ...experienceZh, ...authenticationZh, ...activityZh },
};
export type Locale = keyof typeof dictionaries;
const Context = createContext({
  locale: "zh-CN" as Locale,
  setLocale: (_: Locale) => {},
  t: (key: string) => key,
});
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem("locale");
    if (value === "en" || value === "zh-CN") setLocale(value);
    setHydrated(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    if (hydrated) localStorage.setItem("locale", locale);
  }, [locale, hydrated]);
  const dictionary = dictionaries[locale] as Record<string, string>;
  const t = (key: string) =>
    Object.hasOwn(dictionary, key) ? dictionary[key] : key;
  return (
    <Context.Provider value={{ locale, setLocale, t }}>
      {children}
    </Context.Provider>
  );
}
export const useI18n = () => useContext(Context);
