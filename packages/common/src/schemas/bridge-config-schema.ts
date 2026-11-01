import type { JSONSchema7 } from "json-schema";
import { repeatCommandDefaults } from "../bridge-data.js";
import { HomeAssistantMatcherType } from "../home-assistant-filter.js";

const homeAssistantMatcherSchema: JSONSchema7 = {
  type: "object",
  default: { type: "", value: "" },
  properties: {
    type: {
      title: "Type",
      type: "string",
      enum: Object.values(HomeAssistantMatcherType),
    },
    value: {
      title: "Value",
      type: "string",
      minLength: 1,
    },
  },
  required: ["type", "value"],
  additionalProperties: false,
};

const homeAssistantFilterSchema: JSONSchema7 = {
  title: "Include or exclude entities",
  type: "object",
  properties: {
    include: {
      title: "Include",
      type: "array",
      items: homeAssistantMatcherSchema,
    },
    exclude: {
      title: "Exclude",
      type: "array",
      items: homeAssistantMatcherSchema,
    },
  },
  required: ["include", "exclude"],
  additionalProperties: false,
};

const featureFlagSchema: JSONSchema7 = {
  title: "Feature Flags",
  type: "object",
  properties: {
    coverDoNotInvertPercentage: {
      title: "Do not invert Percentages for Covers",
      description:
        "Do not invert the percentage of covers to match Home Assistant (not Matter compliant)",
      type: "boolean",
      default: false,
    },

    includeHiddenEntities: {
      title: "Include Hidden Entities",
      description:
        "Include entities that are marked as hidden in Home Assistant",
      type: "boolean",
      default: false,
    },
  },
  additionalProperties: false,
};

export const bridgeConfigSchema: JSONSchema7 = {
  type: "object",
  title: "Bridge Config",
  properties: {
    name: {
      title: "Name",
      type: "string",
      minLength: 1,
      maxLength: 32,
    },
    port: {
      title: "Port",
      type: "number",
      minimum: 1,
    },
    countryCode: {
      title: "Country Code",
      type: "string",
      description:
        "An ISO 3166-1 alpha-2 code to represent the country in which the Node is located. Only needed if the commissioning fails due to missing country code.",
      minLength: 2,
      maxLength: 3,
    },
    filter: homeAssistantFilterSchema,
    featureFlags: featureFlagSchema,
    repeatCommands: {
      title: "Repeat matching commands",
      description:
        "Forward requests even when Home Assistant already reports the requested value. Useful after manual control. Applies only to requests the bridge receives; status updates are never replayed. Unchecked categories skip matching requests. Defaults preserve existing behavior.",
      type: "object",
      default: {},
      properties: Object.fromEntries(
        Object.entries({
          shades: "Shades — open, close, position and tilt",
          brightness: "Brightness and volume levels",
          color: "Light color and color temperature",
          climate: "Climate — operating mode and target temperature",
          fans: "Fans — mode, speed and direction",
          onOff: "On/off — lights, switches and other devices",
          locks: "Locks — lock and unlock",
          mediaInputs: "Media input selection",
        }).map(([key, title]) => [
          key,
          {
            title,
            type: "boolean",
            default:
              repeatCommandDefaults[key as keyof typeof repeatCommandDefaults],
          },
        ]),
      ),
      additionalProperties: false,
    },
  },
  required: ["name", "port", "filter"],
  additionalProperties: false,
};
