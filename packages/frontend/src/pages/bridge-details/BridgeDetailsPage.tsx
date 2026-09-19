import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { memo, useCallback } from "react";
import { useParams } from "react-router";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { BridgeDetails } from "../../components/bridge/BridgeDetails.tsx";
import { BridgeStatusHint } from "../../components/bridge/BridgeStatusHint.tsx";
import { BridgeStatusIcon } from "../../components/bridge/BridgeStatusIcon.tsx";
import { EndpointList } from "../../components/endpoints/EndpointList.tsx";
import {
  PageLoading,
  PageMessage,
  RetryButton,
} from "../../components/misc/PageState.tsx";
import { useBridge } from "../../hooks/data/bridges.ts";
import { useDevices } from "../../hooks/data/devices.ts";
import { useTimer } from "../../hooks/timer.ts";
import { navigation } from "../../routes.tsx";
import { loadDevices } from "../../state/devices/device-actions.ts";
import { useAppDispatch } from "../../state/hooks.ts";
import { BridgeMoreMenu } from "./BridgeMoreMenu.tsx";

const MemoizedBridgeDetails = memo(BridgeDetails);
const MemoizedEndpointList = memo(EndpointList);

export const BridgeDetailsPage = () => {
  const dispatch = useAppDispatch();

  const { bridgeId } = useParams() as { bridgeId: string };

  const timerCallback = useCallback(() => {
    dispatch(loadDevices(bridgeId));
  }, [dispatch, bridgeId]);
  const timer = useTimer(10, timerCallback);

  const {
    content: bridge,
    isInitialized: bridgeInitialized,
    isLoading: bridgeLoading,
    error: bridgeError,
  } = useBridge(bridgeId);
  const {
    content: devices,
    isInitialized: devicesInitialized,
    isLoading: devicesLoading,
    error: devicesError,
  } = useDevices(bridgeId);

  if (!bridgeInitialized || (!bridge && bridgeLoading)) {
    return <PageLoading label="Loading bridge details" />;
  }

  if (bridgeError) {
    return (
      <PageMessage
        kind="error"
        title="Could not load this bridge"
        message={bridgeError.message ?? "The bridge service did not respond."}
      />
    );
  }

  if (!bridge) {
    return (
      <PageMessage
        title="Bridge not found"
        message="It may have been removed from Matter Hub Plus."
      />
    );
  }

  return (
    <Stack spacing={4}>
      <Breadcrumbs
        items={[
          { name: "Bridges", to: navigation.bridges },
          { name: bridge.name, to: navigation.bridge(bridgeId) },
        ]}
      />

      <Box display="flex" justifyContent="space-between">
        <Typography variant="h4">
          {bridge.name} <BridgeStatusIcon status={bridge.status} />
        </Typography>
        <BridgeMoreMenu bridge={bridgeId} bridgeName={bridge.name} />
      </Box>

      <BridgeStatusHint status={bridge.status} reason={bridge.statusReason} />

      <MemoizedBridgeDetails bridge={bridge} />

      <Stack spacing={2}>
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={1}
        >
          {timer != null && (
            <Tooltip title="Device state refreshes automatically.">
              <Typography variant="body2" color="textSecondary">
                Refreshing in {timer} seconds
              </Typography>
            </Tooltip>
          )}
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => dispatch(loadDevices(bridgeId))}
            disabled={devicesLoading}
          >
            Refresh now
          </Button>
        </Box>

        {(!devicesInitialized || devicesLoading) && !devices ? (
          <PageLoading label="Loading exposed devices" />
        ) : devicesError ? (
          <PageMessage
            kind="error"
            title="Could not load exposed devices"
            message={
              devicesError.message ?? "The bridge did not return its devices."
            }
            action={
              <RetryButton
                onClick={() => void dispatch(loadDevices(bridgeId))}
              />
            }
          />
        ) : devices ? (
          <MemoizedEndpointList endpoint={devices} />
        ) : (
          <PageMessage
            title="No device data yet"
            message="Refresh the bridge to try again."
          />
        )}
      </Stack>
    </Stack>
  );
};
