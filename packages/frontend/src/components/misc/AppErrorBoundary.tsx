import Button from "@mui/material/Button";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { PageMessage } from "./PageState.tsx";

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
    console.error("Matter Hub Plus could not render", error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <PageMessage
          kind="error"
          title="Matter Hub Plus could not load"
          message="Reload the page. If the problem continues, check the add-on logs."
          action={
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
