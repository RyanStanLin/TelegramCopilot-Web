"use client";
import { Avatar, Stack } from "@primer/react";
import { PersonIcon } from "@primer/octicons-react";
import { useState } from "react";
import css from "./ResourceAvatar.module.css";

export function ResourceAvatar({
  id,
  revision,
}: {
  id: string;
  revision: number;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <Stack as="span" align="center" justify="center" className={css.fallback}>
      <PersonIcon size={16} aria-hidden="true" />
    </Stack>
  ) : (
    <Avatar
      size={32}
      alt=""
      loading="lazy"
      src={`/api/backend/targets/${id}/avatar?v=${revision}`}
      onError={() => setFailed(true)}
    />
  );
}
