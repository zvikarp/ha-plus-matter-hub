import { muiStyles } from "@ha-plus/ui/mui";
import { useLocalizer } from "@ha-plus/ui/react";
import type { BridgeDataWithMetadata } from "@ha-plus-matter-hub/common";
import QrCode from "@mui/icons-material/QrCode";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router";
import { navigation } from "../../routes.tsx";
import messages from "../../translations/en.json";
import { BridgeStatusIcon } from "./BridgeStatusIcon.tsx";

export interface BridgeCardProps {
  bridge: BridgeDataWithMetadata;
}

export const BridgeCard = ({ bridge }: BridgeCardProps) => {
  const t = useLocalizer(messages);

  return (
    <Card variant="elevation">
      <CardActionArea component={RouterLink} to={navigation.bridge(bridge.id)}>
        <CardContent sx={muiStyles.row}>
          <Box sx={muiStyles.centeredRow}>
            <QrCode sx={muiStyles.largeIcon} />
          </Box>
          <Box sx={muiStyles.growColumn}>
            <Typography sx={muiStyles.wrapText}>
              {bridge.name} <BridgeStatusIcon status={bridge.status} />
            </Typography>
            <Grid container>
              <Grid size={6}>
                <Typography variant="caption" component="div">
                  <div>
                    {t("fabrics")}
                    {bridge.commissioning?.fabrics.length ?? 0}
                  </div>
                  <div>
                    {t("devices")}
                    {bridge.deviceCount}
                  </div>
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" component="div">
                  <div>
                    {t("port")}
                    {bridge.port}
                  </div>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
