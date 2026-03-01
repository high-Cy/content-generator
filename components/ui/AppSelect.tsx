"use client";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  type SelectProps,
} from "@mui/material";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface AppSelectProps extends Omit<SelectProps, "variant"> {
  label: string;
  options: SelectOption[];
  helperText?: string;
  error?: boolean;
}

export default function AppSelect({
  label,
  options,
  helperText,
  error,
  ...props
}: AppSelectProps) {
  const labelId = `${String(props.name ?? label).toLowerCase().replace(/\s/g, "-")}-label`;

  return (
    <FormControl fullWidth error={error}>
      <InputLabel
        id={labelId}
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.82rem",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        label={label}
        variant="outlined"
        sx={{
          borderRadius: 0,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.88rem",
          backgroundColor: "background.paper",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "text.secondary",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "text.primary",
            borderWidth: "1px",
          },
        }}
        {...props}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
