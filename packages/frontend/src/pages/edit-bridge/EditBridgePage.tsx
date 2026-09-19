import type { BridgeConfig } from "@ha-plus-matter-hub/common";
import Stack from "@mui/material/Stack";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";
import { PageLoading, PageMessage } from "../../components/misc/PageState.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import {
  useBridge,
  useUpdateBridge,
  useUsedPorts,
} from "../../hooks/data/bridges.ts";
import { navigation } from "../../routes.tsx";

export const EditBridgePage = () => {
  const notifications = useNotifications();
  const navigate = useNavigate();

  const { bridgeId } = useParams() as { bridgeId: string };
  const {
    content: bridge,
    isInitialized,
    isLoading,
    error,
  } = useBridge(bridgeId);
  const usedPorts = useUsedPorts();
  const updateBridge = useUpdateBridge();

  const bridgeConfig = useMemo<BridgeConfig | undefined>(() => {
    if (isLoading || !bridge) {
      return undefined;
    }
    return {
      name: bridge.name,
      port: bridge.port,
      countryCode: bridge.countryCode,
      filter: bridge.filter,
      featureFlags: bridge.featureFlags,
    };
  }, [isLoading, bridge]);

  const cancelAction = () => {
    navigate(-1);
  };

  const saveAction = async (config: BridgeConfig) => {
    await updateBridge({ ...config, id: bridgeId })
      .then(() =>
        notifications.show({
          message: "Update completed",
          severity: "success",
        }),
      )
      .then(() => cancelAction())
      .catch((err: Error) =>
        notifications.show({ message: err.message, severity: "error" }),
      );
  };

  if (!isInitialized || isLoading || !usedPorts) {
    return <PageLoading label="Loading bridge configuration" />;
  }
  if (error) {
    return (
      <PageMessage
        kind="error"
        title="Could not load this bridge"
        message={error.message ?? "The bridge service did not respond."}
      />
    );
  }
  if (!bridge || !bridgeConfig) {
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
          { name: "Edit", to: navigation.editBridge(bridgeId) },
        ]}
      />

      <BridgeConfigEditor
        bridgeId={bridgeId}
        bridge={bridgeConfig}
        usedPorts={usedPorts}
        onSave={saveAction}
        onCancel={cancelAction}
      />
    </Stack>
  );
};
