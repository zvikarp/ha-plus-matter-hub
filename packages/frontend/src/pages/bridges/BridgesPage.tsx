import { Add } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Link } from "react-router";
import { BridgeList } from "../../components/bridge/BridgeList";
import {
  PageLoading,
  PageMessage,
  RetryButton,
} from "../../components/misc/PageState.tsx";
import { useBridges } from "../../hooks/data/bridges";
import { navigation } from "../../routes.tsx";
import { loadBridges } from "../../state/bridges/bridge-actions.ts";
import { useAppDispatch } from "../../state/hooks.ts";

export const BridgesPage = () => {
  const dispatch = useAppDispatch();
  const { content: bridges, isInitialized, isLoading, error } = useBridges();

  if ((!isInitialized || isLoading) && !bridges) {
    return <PageLoading label="Loading bridges" />;
  }

  if (error) {
    return (
      <PageMessage
        kind="error"
        title="Could not load bridges"
        message={
          error.message ?? "Matter Hub Plus could not reach the bridge service."
        }
        action={<RetryButton onClick={() => void dispatch(loadBridges())} />}
      />
    );
  }

  if (!bridges?.length) {
    return (
      <PageMessage
        title="Create your first Matter bridge"
        message="Choose which Home Assistant devices to expose, then pair the bridge with your preferred smart-home controller."
        action={
          <Button
            component={Link}
            to={navigation.createBridge}
            startIcon={<Add />}
            variant="contained"
          >
            Create bridge
          </Button>
        }
      />
    );
  }

  return (
    <Stack spacing={4}>
      <Box display="flex" justifyContent="end" paddingTop={{ xs: 1, sm: 0 }}>
        <Button
          component={Link}
          to={navigation.createBridge}
          endIcon={<Add />}
          variant="outlined"
        >
          Create new bridge
        </Button>
      </Box>

      <BridgeList bridges={bridges} />
    </Stack>
  );
};
