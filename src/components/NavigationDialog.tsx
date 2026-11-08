"use client";
import {
  Dialog,
  IconButton,
  Stack,
  type DialogHeaderProps,
} from "@primer/react";
import { XIcon } from "@primer/octicons-react";
import { useI18n } from "@/i18n/provider";
import { Navigation } from "./Navigation";
function Header({ dialogLabelId, title, onClose }: DialogHeaderProps) {
  const { t } = useI18n();
  return (
    <Dialog.Header>
      <Stack direction="horizontal" align="center" justify="space-between">
        <Dialog.Title id={dialogLabelId}>{title}</Dialog.Title>
        <IconButton
          size="medium"
          icon={XIcon}
          aria-label={t("closeMenu")}
          onClick={() => onClose("close-button")}
        />
      </Stack>
    </Dialog.Header>
  );
}
export function NavigationDialog({
  close,
  trigger,
}: {
  close: () => void;
  trigger: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Dialog
      title="TelegramCopilot"
      position="left"
      width="small"
      onClose={close}
      returnFocusRef={trigger}
      renderHeader={Header}
    >
      <Navigation close={close} />
    </Dialog>
  );
}
