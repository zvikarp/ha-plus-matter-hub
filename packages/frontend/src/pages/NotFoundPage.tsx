import Button from "@mui/material/Button";
import { Link } from "react-router";
import { PageMessage } from "../components/misc/PageState.tsx";

export const NotFoundPage = () => (
  <PageMessage
    title="Page not found"
    message="The page may have moved or the bridge may no longer exist."
    action={
      <Button component={Link} to="/bridges" variant="contained">
        View bridges
      </Button>
    }
  />
);
