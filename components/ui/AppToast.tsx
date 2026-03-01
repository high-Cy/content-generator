"use client";

import { Snackbar, Alert, type AlertColor } from "@mui/material";

interface AppToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  duration?: number;
}

const AppToast = ({
  open,
  message,
  severity = "success",
  onClose,
  duration = 4000,
}: AppToastProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "0.82rem" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

// ─── useToast hook ────────────────────────────────────────────────────────────
// Usage:
//   const { toast, showToast, hideToast } = useToast();
//   showToast("Saved to Notion!", "success");
//   <AppToast {...toast} onClose={hideToast} />

import { useState } from "react";

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message: string, severity: AlertColor = "success") => {
    setToast({ open: true, message, severity });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  return { toast, showToast, hideToast };
}

export default AppToast;