import React from "react";

export type PropsWithStyle<T = {}> = T & {
  style?: React.CSSProperties;
};
