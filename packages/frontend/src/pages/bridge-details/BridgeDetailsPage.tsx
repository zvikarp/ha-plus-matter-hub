import { muiStyles } from "@ha-plus/ui/mui";
import { useLocalizer } from "@ha-plus/ui/react";
import { ContentCard } from "@ha-plus/ui/react-mui";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { memo, useCallback } from "react";
import { useParams } from "react-router";
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
import { loadDevices } from "../../state/devices/device-actions.ts";
import { useAppDispatch } from "../../state/hooks.ts";
import messages from "../../translations/en.json";
import { BridgeMoreMenu } from "./BridgeMoreMenu.tsx";

const MemoizedBridgeDetails = memo(BridgeDetails);
const MemoizedEndpointList = memo(EndpointList);

export const BridgeDetailsPage = () => {
  const t = useLocalizer(messages);

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
    return <PageLoading label={t("loading_bridge_details")} />;
  }

  if (bridgeError) {
    return (
      <PageMessage
        kind="error"
        title={t("could_not_load_this_bridge")}
        message={bridgeError.message ?? t("the_bridge_service_did_not_respond")}
      />
    );
  }

  if (!bridge) {
    return (
      <PageMessage
        title={t("bridge_not_found")}
        message={t("it_may_have_been_removed_from_ha_matter_hub")}
      />
    );
  }

  return (
    <ContentCard
      title={
        <>
          {bridge.name} <BridgeStatusIcon status={bridge.status} />
        </>
      }
      actions={<BridgeMoreMenu bridge={bridgeId} bridgeName={bridge.name} />}
    >
      <BridgeStatusHint status={bridge.status} reason={bridge.statusReason} />

      <MemoizedBridgeDetails bridge={bridge} />

      <Stack spacing={2}>
        <Box sx={muiStyles.wrappedActions}>
          {timer != null && (
            <Tooltip title={t("device_state_refreshes_automatically")}>
              <Typography variant="body2" color="textSecondary">
                {t("refreshing_in_seconds", { count: timer })}
              </Typography>
            </Tooltip>
          )}
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => dispatch(loadDevices(bridgeId))}
            disabled={devicesLoading}
          >
            {t("refresh_now")}
          </Button>
        </Box>

        {(!devicesInitialized || devicesLoading) && !devices ? (
          <PageLoading label={t("loading_exposed_devices")} />
        ) : devicesError ? (
          <PageMessage
            kind="error"
            title={t("could_not_load_exposed_devices")}
            message={
              devicesError.message ?? t("the_bridge_did_not_return_its_devices")
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
            title={t("no_device_data_yet")}
            message={t("refresh_the_bridge_to_try_again")}
          />
        )}
      </Stack>
    </ContentCard>
  );
};
