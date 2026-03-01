"use client";

import {
  Button,
  CircularProgress,
  type ButtonProps,
} from "@mui/material";
import { forwardRef } from "react";

interface AppButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  loading?: boolean;
}

const variantMap: Record<
  NonNullable<AppButtonProps["variant"]>,
  { variant: ButtonProps["variant"]; color: ButtonProps["color"] }
> = {
  primary: { variant: "contained", color: "primary" },
  outline: { variant: "outlined", color: "primary" },
  ghost: { variant: "outlined", color: "secondary" },
  danger: { variant: "contained", color: "error" },
};

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      disabled,
      children,
      startIcon,
      ...props
    },
    ref
  ) => {
    const { variant: muiVariant, color } = variantMap[variant];

    return (
      <Button
        ref={ref}
        variant={muiVariant}
        color={color}
        disabled={disabled || loading}
        startIcon={
          loading ? <CircularProgress size={14} color="inherit" /> : startIcon
        }
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AppButton.displayName = "AppButton";
export default AppButton;
