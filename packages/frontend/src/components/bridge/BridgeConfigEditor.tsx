import { haContext, localizeSchema } from "@ha-plus/ui/ha";
import { useLocalizer } from "@ha-plus/ui/react";
import { FormActions } from "@ha-plus/ui/react-mui";
import {
  type BridgeConfig,
  bridgeConfigSchema,
} from "@ha-plus-matter-hub/common";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useCallback, useId, useRef, useState } from "react";
import { navigation } from "../../routes.tsx";
import messages from "../../translations/en.json";
import { FormEditor } from "../misc/editors/FormEditor";
import { JsonEditor } from "../misc/editors/JsonEditor";
import type { ValidationError } from "../misc/editors/validation-error.ts";

enum BridgeEditorMode {
  JSON_EDITOR = "JSON_EDITOR",
  FIELDS_EDITOR = "FIELDS_EDITOR",
}

export interface BridgeConfigEditorProps {
  bridgeId?: string;
  bridge: BridgeConfig;
  usedPorts: Record<number, string>;
  onSave: (config: BridgeConfig) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export const BridgeConfigEditor = (props: BridgeConfigEditorProps) => {
  const t = useLocalizer(messages);

  const schema = localizeSchema(haContext(), bridgeConfigSchema, messages);

  const [editorMode, setEditorMode] = useState<BridgeEditorMode>(
    BridgeEditorMode.FIELDS_EDITOR,
  );
  const editorId = useId();

  const [config, setConfig] = useState<object | undefined>(props.bridge);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);

  const validatePort = useCallback(
    (value: object | undefined): ValidationError[] => {
      const config = value as Partial<BridgeConfig> | undefined;
      if (!config?.port) {
        return [];
      }
      const usedBy = props.usedPorts[config.port];
      if (usedBy !== undefined && usedBy !== props.bridgeId) {
        return [
          {
            instancePath: "/port",
            message: t("port_is_already_used_by_bridge_with_id", {
              value1: usedBy,
            }),
          },
        ];
      }
      return [];
    },
    [props.bridgeId, props.usedPorts, t],
  );

  const onChange = (data: object | undefined, isValid: boolean) => {
    setConfig(data);
    setIsValid(isValid);
  };

  const saveAction = async () => {
    if (!isValid || saving.current) return;
    saving.current = true;
    setIsSaving(true);
    try {
      await props.onSave(config as BridgeConfig);
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <>
      <Alert severity="warning" variant="outlined">
        {t("please_consult")}{" "}
        <Link href={navigation.faq.bridgeConfig} target="_blank">
          {t("the_documentation")}
        </Link>{" "}
        {t("for_proper_bridge_configurations")}{" "}
        <strong>
          {t("especially_if_you_are_using_labels_see_the_labels_section")}
        </strong>
      </Alert>

      <Stack spacing={2}>
        <Tabs
          value={editorMode}
          onChange={(_, value: BridgeEditorMode) => setEditorMode(value)}
          aria-label={t("bridge_editor")}
        >
          <Tab
            value={BridgeEditorMode.FIELDS_EDITOR}
            label={t("form_editor")}
            id={`${editorId}-fields-tab`}
            aria-controls={`${editorId}-fields`}
            disabled={isSaving}
          />
          <Tab
            value={BridgeEditorMode.JSON_EDITOR}
            label={t("json_editor")}
            id={`${editorId}-json-tab`}
            aria-controls={`${editorId}-json`}
            disabled={isSaving}
          />
        </Tabs>

        {editorMode === BridgeEditorMode.FIELDS_EDITOR && (
          <Box
            role="tabpanel"
            id={`${editorId}-fields`}
            aria-labelledby={`${editorId}-fields-tab`}
          >
            <FormEditor
              value={config ?? {}}
              onChange={onChange}
              schema={schema}
              customValidate={validatePort}
            />
          </Box>
        )}

        {editorMode === BridgeEditorMode.JSON_EDITOR && (
          <Box
            role="tabpanel"
            id={`${editorId}-json`}
            aria-labelledby={`${editorId}-json-tab`}
          >
            <JsonEditor
              value={config ?? {}}
              onChange={onChange}
              schema={schema}
              customValidate={validatePort}
            />
          </Box>
        )}

        <FormActions
          onSave={saveAction}
          onCancel={props.onCancel}
          disabled={!isValid}
          saving={isSaving}
        />
      </Stack>
    </>
  );
};
