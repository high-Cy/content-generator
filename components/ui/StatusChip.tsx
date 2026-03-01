import { Chip, type ChipProps } from "@mui/material";

type StatusVariant = "default" | "active" | "success" | "warning" | "error";

interface StatusChipProps extends Omit<ChipProps, "color" | "variant"> {
  status?: StatusVariant;
}

const statusColorMap: Record<StatusVariant, ChipProps["color"]> = {
  default: "default",
  active: "primary",
  success: "success",
  warning: "warning",
  error: "error",
};

export default function StatusChip({
  status = "default",
  ...props
}: StatusChipProps) {
  return (
    <Chip
      color={statusColorMap[status]}
      size="small"
      variant="filled"
      {...props}
    />
  );
}
