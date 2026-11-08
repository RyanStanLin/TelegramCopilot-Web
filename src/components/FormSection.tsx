import { Heading, Stack } from "@primer/react";
import css from "./Shared.module.css";
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={css.section}>
      <Stack gap="normal">
        <Heading as="h2" variant="small" className={css.sectionTitle}>
          {title}
        </Heading>
        {children}
      </Stack>
    </section>
  );
}
