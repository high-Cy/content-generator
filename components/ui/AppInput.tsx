"use client";

import { TextField, type TextFieldProps } from "@mui/material";
import { forwardRef } from "react";

type AppInputProps = Omit<TextFieldProps, "variant"> & {
  /** Makes the input a textarea. Pass number for fixed rows, true for auto-grow. */
  multiline?: boolean;
  rows?: number;
};

const AppInput = forwardRef<HTMLDivElement, AppInputProps>(
  ({ multiline, rows, ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant="outlined"
        fullWidth
        multiline={multiline}
        rows={multiline && rows ? rows : undefined}
        minRows={multiline && !rows ? 3 : undefined}
        maxRows={multiline && !rows ? 10 : undefined}
        {...props}
      />
    );
  }
);

AppInput.displayName = "AppInput";
export default AppInput;
