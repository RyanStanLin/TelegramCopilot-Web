"use client";
import { Button, Checkbox, FormControl, Stack, TextInput } from "@primer/react";
import { useI18n } from "@/i18n/provider";
import type { Kind } from "@/lib/types";
import { Failure } from "@/components/Status";
import { FormSection } from "@/components/FormSection";
import { Fields } from "./Fields";
import { RuleTemplatePanel } from "./RuleTemplatePanel";
import type { useResourceEditor } from "./use-resource-editor";
export function ResourceEditorForm({
  kind,
  id,
  editor,
  cancel,
}: {
  kind: Kind;
  id: string;
  editor: ReturnType<typeof useResourceEditor>;
  cancel: () => void;
}) {
  const { t } = useI18n();
  const {
    form,
    save,
    name,
    setName,
    enabled,
    setEnabled,
    values,
    references,
    setDirty,
    busy,
    error,
    invalid,
  } = editor;
  return (
    <form ref={form} noValidate onSubmit={save} onChange={() => setDirty(true)}>
      <Stack gap="spacious">
        {error && <Failure message="saveFailed" focus />}
        <FormSection title={t("generalSettings")}>
          <FormControl required>
            <FormControl.Label>{t("name")}</FormControl.Label>
            <TextInput
              size="medium"
              block
              value={name}
              onChange={(e) => setName(e.target.value)}
              validationStatus={invalid.includes("name") ? "error" : undefined}
            />
            {invalid.includes("name") && (
              <FormControl.Validation variant="error">
                {t("required")}
              </FormControl.Validation>
            )}
          </FormControl>
          <FormControl>
            <Checkbox
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <FormControl.Label>{t("enabled")}</FormControl.Label>
          </FormControl>
        </FormSection>
        {kind === "rules" && (
          <RuleTemplatePanel
            template={editor.template}
            loading={editor.templateLoading}
            error={editor.templateError}
            isNew={id === "new"}
            apply={() => {
              editor.applyTemplate();
              setDirty(true);
            }}
          />
        )}
        <Fields
          kind={kind}
          values={values}
          references={references}
          invalid={invalid}
          change={(key, value) => {
            editor.changeValue(key, value);
            setDirty(true);
          }}
        />
        <Stack direction="horizontal" gap="condensed" justify="end" wrap="wrap">
          <Button size="medium" onClick={cancel}>
            {t("cancel")}
          </Button>
          <Button
            size="medium"
            type="submit"
            variant="primary"
            loading={busy}
            loadingAnnouncement={t("loading")}
          >
            {t("save")}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
