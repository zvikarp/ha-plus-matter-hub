import { useLocalizer } from "@ha-plus/ui/react";
import { PageHeader } from "@ha-plus/ui/react-mui";
import type { BridgeConfig } from "@ha-plus-matter-hub/common";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs.tsx";
import { BridgeConfigEditor } from "../../components/bridge/BridgeConfigEditor.tsx";
import { PageLoading, PageMessage } from "../../components/misc/PageState.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import {
  useBridges,
  useCreateBridge,
  useUsedPorts,
} from "../../hooks/data/bridges.ts";
import { navigation } from "../../routes.tsx";
import messages from "../../translations/en.json";

const defaultConfig: Omit<BridgeConfig, "port"> = {
  name: "",
  featureFlags: {},
  filter: {
    include: [],
    exclude: [],
  },
};

function nextFreePort(usedPorts: Record<number, string>) {
  let port = 5540;
  while (usedPorts[port]) {
    port++;
  }
  return port;
}

export const CreateBridgePage = () => {
  const t = useLocalizer(messages);

  const notifications = useNotifications();
  const navigate = useNavigate();

  const bridges = useBridges();
  const showReuseBridgeHint = !!bridges.content?.length;
  const usedPorts = useUsedPorts();
  const bridgeConfig: BridgeConfig | undefined = useMemo(() => {
    if (usedPorts) {
      return { ...defaultConfig, port: nextFreePort(usedPorts) };
    }
    return undefined;
  }, [usedPorts]);

  const createBridge = useCreateBridge();

  const cancelAction = () => {
    navigate(-1);
  };

  const saveAction = async (config: BridgeConfig) => {
    await createBridge({ ...config })
      .then(() =>
        notifications.show({ message: t("bridge_saved"), severity: "success" }),
      )
      .then(() => cancelAction())
      .catch((err: Error) =>
        notifications.show({ message: err.message, severity: "error" }),
      );
  };

  if (bridges.error) {
    return (
      <PageMessage
        kind="error"
        title={t("could_not_prepare_a_new_bridge")}
        message={
          bridges.error.message ?? t("the_bridge_service_did_not_respond")
        }
      />
    );
  }

  if (!bridgeConfig || !usedPorts) {
    return <PageLoading label={t("preparing_bridge_configuration")} />;
  }

  return (
    <Stack spacing={4}>
      <Breadcrumbs
        items={[
          { name: t("bridges"), to: navigation.bridges },
          { name: t("create_new"), to: navigation.createBridge },
        ]}
      />

      {showReuseBridgeHint && (
        <Alert severity="info" variant="outlined">
          <Typography>
            {t(
              "did_you_know_that_you_can_connect_the_same_bridge_with_multiple_assistants",
            )}{" "}
            <Link href={navigation.faq.multiFabric} target="_blank">
              {t("learn_more")}
            </Link>
          </Typography>
        </Alert>
      )}

      <PageHeader title={t("create_bridge")} />

      <BridgeConfigEditor
        bridge={bridgeConfig}
        usedPorts={usedPorts}
        onSave={saveAction}
        onCancel={cancelAction}
      />
    </Stack>
  );
};
