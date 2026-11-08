import { createLocalizer, haContext } from "@ha-plus/ui/ha";
import Button from "@mui/material/Button";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import messages from "../../translations/en.json";
import { PageMessage } from "./PageState.tsx";

const tr = createLocalizer(haContext, messages);

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("HA+ Matter Hub could not render", error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <PageMessage
          kind="error"
          title={tr("ha_matter_hub_could_not_load")}
          message={tr(
            "reload_the_page_if_the_problem_continues_check_the_add_on_logs",
          )}
          action={
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              {tr("reload_page")}
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
