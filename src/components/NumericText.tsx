import { Fragment } from "react";
import css from "./NumericText.module.css";

export function NumericText({ children }: { children: string | number }) {
  return String(children)
    .split(/(\d+(?:[.,:/-]\d+)*)/u)
    .map((part, index) =>
      /^\d/u.test(part) ? (
        <span key={index} className={css.number} data-numeric="">
          {part}
        </span>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    );
}
