import { inlineStyles, muiStyles } from "@ha-plus/ui/mui";
import { useLocalizer } from "@ha-plus/ui/react";
import type { BridgeFabric } from "@ha-plus-matter-hub/common";
import QuestionMark from "@mui/icons-material/QuestionMark";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { type FC, type SVGProps, useMemo } from "react";
import AmazonIcon from "../../assets/brands/Amazon.svg?react";
import AppleIcon from "../../assets/brands/Apple.svg?react";
import GoogleIcon from "../../assets/brands/Google.svg?react";
import SamsungIcon from "../../assets/brands/Samsung.svg?react";
import messages from "../../translations/en.json";

export interface FabricIconProps {
  fabric: BridgeFabric;
}

const iconsPerKeyword: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  Alexa: AmazonIcon,
  Apple: AppleIcon,
  Google: GoogleIcon,
};

const iconPerVendorId: Record<number, FC<SVGProps<SVGSVGElement>> | undefined> =
  {
    4631: AmazonIcon,
    4937: AppleIcon,
    4996: AppleIcon,
    24582: GoogleIcon,
    4321: SamsungIcon,
    4362: SamsungIcon,
  };

function getIcon(fabric: BridgeFabric) {
  const icon = iconPerVendorId[fabric.rootVendorId];
  if (icon) {
    return icon;
  }
  return Object.entries(iconsPerKeyword).find(([keyword]) =>
    fabric.label.toUpperCase().includes(keyword.toUpperCase()),
  )?.[1];
}

export const FabricIcon = ({ fabric }: FabricIconProps) => {
  const t = useLocalizer(messages);

  const BrandIcon = useMemo(() => getIcon(fabric), [fabric]);
  return (
    <Tooltip
      title={t("0x", {
        value1: fabric.label,
        value2: fabric.rootVendorId.toString(16),
      })}
      arrow
    >
      <Box component="span" sx={muiStyles.themedIcon}>
        {BrandIcon ? (
          <BrandIcon style={inlineStyles.brandIcon} />
        ) : (
          <QuestionMark />
        )}
      </Box>
    </Tooltip>
  );
};
