import { useLocalizer } from "@ha-plus/ui/react";
import { ContentCard } from "@ha-plus/ui/react-mui";
import type { BridgeConfig } from "@ha-plus-matter-hub/common";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";
import { PageLoading, PageMessage } from "../../components/misc/PageState.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import {
  useBridge,
  useUpdateBridge,
  useUsedPorts,
} from "../../hooks/data/bridges.ts";
import { navigation } from "../../routes.tsx";
import messages from "../../translations/en.json";

export const EditBridgePage = () => {
  const t = useLocalizer(messages);

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
      repeatCommands: bridge.repeatCommands,
    };
  }, [isLoading, bridge]);

  const cancelAction = () => {
    navigate(navigation.bridge(bridgeId));
  };

  const saveAction = async (config: BridgeConfig) => {
    await updateBridge({ ...config, id: bridgeId })
      .then(() =>
        notifications.show({
          message: t("update_completed"),
          severity: "success",
        }),
      )
      .then(() => cancelAction())
      .catch((err: Error) =>
        notifications.show({ message: err.message, severity: "error" }),
      );
  };

  if (!isInitialized || isLoading || !usedPorts) {
    return <PageLoading label={t("loading_bridge_configuration")} />;
  }
  if (error) {
    return (
      <PageMessage
        kind="error"
        title={t("could_not_load_this_bridge")}
        message={error.message ?? t("the_bridge_service_did_not_respond")}
      />
    );
  }
  if (!bridge || !bridgeConfig) {
    return (
      <PageMessage
        title={t("bridge_not_found")}
        message={t("it_may_have_been_removed_from_ha_matter_hub")}
      />
    );
  }

  return (
    <ContentCard title={t("edit_bridge", { name: bridge.name })}>
      <BridgeConfigEditor
        bridgeId={bridgeId}
        bridge={bridgeConfig}
        usedPorts={usedPorts}
        onSave={saveAction}
        onCancel={cancelAction}
      />
    </ContentCard>
  );
};
