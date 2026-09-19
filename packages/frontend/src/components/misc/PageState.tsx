import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InboxIcon from "@mui/icons-material/Inbox";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface PageMessageProps {
  title: string;
  message: string;
  action?: ReactNode;
  kind?: "empty" | "error";
}

export const PageMessage = ({
  title,
  message,
  action,
  kind = "empty",
}: PageMessageProps) => (
  <Paper variant="outlined" sx={{ p: 4 }}>
    <Stack spacing={2} alignItems="center" textAlign="center">
      {kind === "error" ? (
        <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
      ) : (
        <InboxIcon color="disabled" sx={{ fontSize: 48 }} />
      )}
      <div>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{message}</Typography>
      </div>
      {action}
    </Stack>
  </Paper>
);

export const RetryButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="contained" onClick={onClick}>
    Try again
  </Button>
);

export const PageLoading = ({ label = "Loading" }: { label?: string }) => (
  <Stack spacing={2} aria-busy="true" aria-label={label}>
    <Skeleton variant="rounded" height={88} />
    <Skeleton variant="rounded" height={88} />
    <Skeleton variant="rounded" height={88} />
  </Stack>
);
