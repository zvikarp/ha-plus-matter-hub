import { inlineStyles, muiStyles } from "@ha-plus/ui/mui";
import type { BridgeDataWithMetadata } from "@ha-plus-matter-hub/common";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { QRCodeSVG } from "qrcode.react";
import { navigation } from "../../routes.tsx";
import { FabricList } from "../fabric/FabricList.tsx";

export interface BridgeDetailsProps {
  readonly bridge: BridgeDataWithMetadata;
}

export const BridgeDetails = ({ bridge }: BridgeDetailsProps) => {
  return (
    <Paper sx={muiStyles.padded}>
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: "auto" }}>
            <Pairing bridge={bridge} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }} sx={muiStyles.shrinkable}>
            <BasicInfo bridge={bridge} />
          </Grid>
          <Grid size={{ xs: 12, md: "grow" }} sx={muiStyles.shrinkable}>
            <CommissioningInfo bridge={bridge} />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} useFlexGap sx={muiStyles.wrap}>
          {bridge.filter.include.map((filter, idx) => (
            <Chip
              key={idx.toString()}
              size="small"
              icon={<AddIcon />}
              label={
                <span>
                  <strong>{filter.type}</strong>: {filter.value}
                </span>
              }
              color="success"
              sx={muiStyles.wrappingChip}
            />
          ))}
          {bridge.filter.exclude.map((filter, idx) => (
            <Chip
              key={idx.toString()}
              size="small"
              icon={<RemoveIcon />}
              label={
                <span>
                  <strong>{filter.type}</strong>: {filter.value}
                </span>
              }
              color="error"
              sx={muiStyles.wrappingChip}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

const Pairing = (props: { bridge: BridgeDataWithMetadata }) => {
  if (!props.bridge.commissioning) {
    return "";
  }
  return (
    <Box sx={muiStyles.centeredHorizontal}>
      <Box sx={muiStyles.qrContainer}>
        {props.bridge.commissioning.isCommissioned && (
          <Box sx={[muiStyles.diagonalBadge, muiStyles.absoluteCenter]}>
            <Alert color="success" variant="filled">
              <Typography
                variant="body2"
                component="a"
                sx={muiStyles.helpLink}
                href={navigation.faq.multiFabric}
                target="_blank"
              >
                Commissioned
              </Typography>
            </Alert>
          </Box>
        )}
        <Box style={inlineStyles.qrSurface}>
          <QRCodeSVG
            value={props.bridge.commissioning.qrPairingCode}
            style={inlineStyles.fill}
          />
        </Box>
      </Box>
    </Box>
  );
};

const BasicInfo = (props: { bridge: BridgeDataWithMetadata }) => {
  return (
    <Typography variant="subtitle2" component="div" sx={muiStyles.wrapText}>
      <div>ID: {props.bridge.id}</div>
      <div>Name: {props.bridge.name}</div>
      <div>Port: {props.bridge.port}</div>
      <div>
        <div>Fabrics:</div>
        <div style={inlineStyles.enlargedText}>
          {props.bridge.commissioning?.fabrics && (
            <FabricList fabrics={props.bridge.commissioning.fabrics} />
          )}
        </div>
      </div>
    </Typography>
  );
};

const CommissioningInfo = (props: { bridge: BridgeDataWithMetadata }) => {
  if (!props.bridge.commissioning) {
    return "";
  }
  return (
    <Typography variant="subtitle2" component="div" sx={muiStyles.wrapText}>
      <div>Passcode: {props.bridge.commissioning.passcode}</div>
      <div>Discriminator: {props.bridge.commissioning.discriminator}</div>
      <div>
        Manual Pairing Code: {props.bridge.commissioning.manualPairingCode}
      </div>
      <div>QR Pairing Code: {props.bridge.commissioning.qrPairingCode}</div>
    </Typography>
  );
};
