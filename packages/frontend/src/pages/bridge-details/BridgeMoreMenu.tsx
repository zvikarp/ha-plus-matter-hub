import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVert from "@mui/icons-material/MoreVert";
import ResetIcon from "@mui/icons-material/RotateLeft";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import { useDeleteBridge, useResetBridge } from "../../hooks/data/bridges.ts";
import { navigation } from "../../routes.tsx";

export interface BridgeMoreMenuProps {
  bridge: string;
  bridgeName: string;
}

type DestructiveAction = "reset" | "delete";

export const BridgeMoreMenu = ({ bridge, bridgeName }: BridgeMoreMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [action, setAction] = React.useState<DestructiveAction>();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const notification = useNotifications();

  const factoryReset = useResetBridge();
  const deleteBridge = useDeleteBridge();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const requestAction = (nextAction: DestructiveAction) => {
    handleClose();
    setAction(nextAction);
  };

  const handleFactoryReset = async () => {
    await factoryReset(bridge)
      .then(() =>
        notification.show({
          message: "Bridge reset successfully",
          severity: "success",
        }),
      )
      .catch((reason) =>
        notification.show({
          message: `Failed to reset bridge: ${String(reason)}`,
          severity: "error",
        }),
      );
  };
  const handleDelete = async () => {
    handleClose();
    await deleteBridge(bridge)
      .then(() =>
        notification.show({
          message: "Bridge deleted successfully",
          severity: "success",
        }),
      )
      .then(() => navigate(navigation.bridges))
      .catch((reason) =>
        notification.show({
          message: `Failed to delete bridge: ${String(reason)}`,
          severity: "error",
        }),
      );
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (action === "reset") {
        await handleFactoryReset();
      } else if (action === "delete") {
        await handleDelete();
      }
      setAction(undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label={`More actions for ${bridgeName}`}
      >
        <MoreVert />
      </IconButton>
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem component={RouterLink} to={navigation.editBridge(bridge)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => requestAction("reset")}>
          <ListItemIcon>
            <ResetIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Factory Reset</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => requestAction("delete")}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog
        open={action !== undefined}
        onClose={() => !isProcessing && setAction(undefined)}
        aria-labelledby="bridge-action-title"
      >
        <DialogTitle id="bridge-action-title">
          {action === "delete" ? "Delete bridge?" : "Factory reset bridge?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {action === "delete"
              ? `This permanently deletes “${bridgeName}” and its configuration. Paired controllers will no longer be able to use its devices.`
              : `This removes every controller paired with “${bridgeName}”. The bridge configuration stays, but you will need to pair each controller again.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAction(undefined)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleConfirm()}
            disabled={isProcessing}
          >
            {isProcessing
              ? "Working…"
              : action === "delete"
                ? "Delete bridge"
                : "Factory reset"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
