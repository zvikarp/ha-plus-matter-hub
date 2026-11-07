import { muiStyles } from "@ha-plus/ui/mui";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";

interface BreadcrumbProps {
  name: string;
  to: string;
}

const Breadcrumb = ({ name, to }: BreadcrumbProps) => {
  return (
    <Link
      color="inherit"
      underline="hover"
      component={RouterLink}
      to={to}
      sx={muiStyles.wrapText}
    >
      {name}
    </Link>
  );
};

export interface BreadcrumbsProps {
  items: BreadcrumbProps[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <MuiBreadcrumbs separator="›" sx={muiStyles.breadcrumbs}>
      {items.map((item, index) => (
        <Breadcrumb key={index.toString()} {...item} />
      ))}
    </MuiBreadcrumbs>
  );
};
