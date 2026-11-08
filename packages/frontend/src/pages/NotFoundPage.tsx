import { useLocalizer } from "@ha-plus/ui/react";
import Button from "@mui/material/Button";
import { Link } from "react-router";
import { PageMessage } from "../components/misc/PageState.tsx";
import messages from "../translations/en.json";

export const NotFoundPage = () => {
  const t = useLocalizer(messages);
  return (
    <PageMessage
      title={t("page_not_found")}
      message={t("the_page_may_have_moved_or_the_bridge_may_no_longer_exist")}
      action={
        <Button component={Link} to="/bridges" variant="contained">
          {t("view_bridges")}
        </Button>
      }
    />
  );
};
