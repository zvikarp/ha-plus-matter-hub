import Button from "@mui/material/Button";
import { PageMessage } from "../components/misc/PageState.tsx";

export const AppErrorPage = () => (
  <PageMessage
    kind="error"
    title="Matter Hub Plus could not load"
    message="Reload the page. If the problem continues, check the add-on logs."
    action={
      <Button variant="contained" onClick={() => window.location.reload()}>
        Reload page
      </Button>
    }
  />
);
