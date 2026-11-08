import { AppFooter as SharedFooter } from "@ha-plus/ui/react-mui";
import { useAppInfo } from "../hooks/app-info.ts";
import { navigation } from "../routes.tsx";

export const AppFooter = () => {
  const { version } = useAppInfo();
  return (
    <SharedFooter
      githubUrl={navigation.githubRepository}
      documentationUrl={navigation.documentation}
      version={version}
    />
  );
};
