import { useLocalizer } from "@ha-plus/ui/react";
import { PageHeader } from "@ha-plus/ui/react-mui";
import { Add } from "@mui/icons-material";
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
import messages from "../../translations/en.json";

export const BridgesPage = () => {
  const t = useLocalizer(messages);

  const dispatch = useAppDispatch();
  const { content: bridges, isInitialized, isLoading, error } = useBridges();

  if ((!isInitialized || isLoading) && !bridges) {
    return <PageLoading label={t("loading_bridges")} />;
  }

  if (error) {
    return (
      <PageMessage
        kind="error"
        title={t("could_not_load_bridges")}
        message={
          error.message ?? t("ha_matter_hub_could_not_reach_the_bridge_service")
        }
        action={<RetryButton onClick={() => void dispatch(loadBridges())} />}
      />
    );
  }

  if (!bridges?.length) {
    return (
      <PageMessage
        title={t("create_your_first_matter_bridge")}
        message={t(
          "choose_which_home_assistant_devices_to_expose_then_pair_the_bridge_with_your_preferre",
        )}
        action={
          <Button
            component={Link}
            to={navigation.createBridge}
            startIcon={<Add />}
            variant="contained"
          >
            {t("create_bridge")}
          </Button>
        }
      />
    );
  }

  return (
    <Stack spacing={4}>
      <PageHeader
        title={t("bridges")}
        actions={
          <Button
            component={Link}
            to={navigation.createBridge}
            endIcon={<Add />}
            variant="outlined"
          >
            {t("create_new_bridge")}
          </Button>
        }
      />

      <BridgeList bridges={bridges} />
    </Stack>
  );
};
