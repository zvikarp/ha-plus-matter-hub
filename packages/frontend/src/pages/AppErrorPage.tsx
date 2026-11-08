import { useLocalizer } from "@ha-plus/ui/react";
import Button from "@mui/material/Button";
import { PageMessage } from "../components/misc/PageState.tsx";
import messages from "../translations/en.json";

export const AppErrorPage = () => {
  const t = useLocalizer(messages);
  return (
    <PageMessage
      kind="error"
      title={t("ha_matter_hub_could_not_load")}
      message={t(
        "reload_the_page_if_the_problem_continues_check_the_add_on_logs",
      )}
      action={
        <Button variant="contained" onClick={() => window.location.reload()}>
          {t("reload_page")}
        </Button>
      }
    />
  );
};
