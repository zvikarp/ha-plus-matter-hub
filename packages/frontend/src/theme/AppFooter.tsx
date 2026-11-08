import { muiStyles } from "@ha-plus/ui/mui";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import { navigation } from "../routes.tsx";

const links: { name: string; url: string }[] = [
  {
    name: "GitHub",
    url: navigation.githubRepository,
  },
  {
    name: "Documentation",
    url: navigation.documentation,
  },
];

export const AppFooter = () => {
  return (
    <Container sx={muiStyles.footer}>
      <Divider sx={muiStyles.dividerSpacing} />
      <Grid container spacing={2} sx={muiStyles.centered}>
        {links.map((link, idx) => (
          <Grid size={{ xs: 12, sm: "auto" }} key={idx.toString()}>
            <Button
              fullWidth
              size="small"
              variant="text"
              component={Link}
              href={link.url}
              target="_blank"
            >
              {link.name}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
