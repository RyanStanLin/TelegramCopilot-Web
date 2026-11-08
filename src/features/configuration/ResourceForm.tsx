"use client";
import { Breadcrumbs, PageHeader, Stack } from "@primer/react";
import NextLink from "next/link";
import { useState } from "react";
import { Confirm } from "@/components/Confirm";
import { useI18n } from "@/i18n/provider";
import type { Kind } from "@/lib/types";
import { Failure, Loading } from "@/components/Status";
import { AccountLogin } from "./AccountLogin";
import { TargetDetail } from "./TargetDetail";
import { ResourceTestActions } from "./ResourceTestActions";
import { ResourceEditorForm } from "./ResourceEditorForm";
import { settingsValues } from "./form-values";
import { useResourceEditor } from "./use-resource-editor";
export function ResourceForm({ kind, id }: { kind: Kind; id: string }) {
  const { t } = useI18n();
  const [cancel, setCancel] = useState(false);
  const editor = useResourceEditor(kind, id);
  const { router, existing, name, enabled, values, dirty, setDirty } = editor;
  if (existing.loading || editor.templateInitializing) return <Loading />;
  if (existing.error) return <Failure />;
  const form = (
    <ResourceEditorForm
      kind={kind}
      id={id}
      editor={editor}
      cancel={() => (dirty ? setCancel(true) : router.push(`/${kind}`))}
    />
  );
  return (
    <Stack gap="spacious">
      <Breadcrumbs aria-label={t("breadcrumbNavigation")}>
        <Breadcrumbs.Item as={NextLink} href={`/${kind}`}>
          {t(kind)}
        </Breadcrumbs.Item>
        <Breadcrumbs.Item selected>
          {id === "new" ? t("new") : existing.data?.name}
        </Breadcrumbs.Item>
      </Breadcrumbs>
      <PageHeader>
        <PageHeader.TitleArea>
          <PageHeader.Title as="h1">
            {id === "new" ? `${t("new")} · ${t(kind)}` : existing.data?.name}
          </PageHeader.Title>
        </PageHeader.TitleArea>
      </PageHeader>
      {kind === "targets" && id !== "new" ? (
        <TargetDetail id={id}>{form}</TargetDetail>
      ) : (
        form
      )}
      {(kind === "schedules" || kind === "rules") && (
        <ResourceTestActions
          kind={kind}
          id={id}
          dirty={dirty}
          changeToken={JSON.stringify({ name, enabled, values })}
          getDraft={() => ({
            name,
            enabled,
            settings: settingsValues(kind, values),
          })}
          recipient={
            kind === "schedules"
              ? String(existing.data?.settings.recipient ?? "")
              : undefined
          }
        />
      )}
      {kind === "accounts" && id !== "new" && (
        <AccountLogin
          key={id}
          id={id}
          phone={String(existing.data?.settings.phone ?? "")}
        />
      )}
      {cancel && (
        <Confirm
          title={t("unsaved")}
          confirmButtonContent={t("discardChanges")}
          cancelButtonContent={t("back")}
          onClose={(g) => {
            setCancel(false);
            if (g === "confirm") {
              setDirty(false);
              router.push(`/${kind}`);
            }
          }}
        />
      )}
    </Stack>
  );
}
