import { haContext, localizeSchema } from "@ha-plus/ui/ha";
import { muiStyles } from "@ha-plus/ui/mui";
import { useLocalizer } from "@ha-plus/ui/react";
import {
  type BridgeConfig,
  bridgeConfigSchema,
} from "@ha-plus-matter-hub/common";
import { LibraryBooks, TextFields } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { useCallback, useRef, useState } from "react";
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
  const toggleEditor = () => {
    setEditorMode(
      editorMode === BridgeEditorMode.FIELDS_EDITOR
        ? BridgeEditorMode.JSON_EDITOR
        : BridgeEditorMode.FIELDS_EDITOR,
    );
  };

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
        <Box sx={muiStyles.endRow}>
          <Button
            onClick={() => toggleEditor()}
            disabled={isSaving}
            title={
              editorMode === BridgeEditorMode.FIELDS_EDITOR
                ? t("json_editor")
                : t("form_editor")
            }
            aria-label={
              editorMode === BridgeEditorMode.FIELDS_EDITOR
                ? t("json_editor")
                : t("form_editor")
            }
            sx={muiStyles.actionTarget}
          >
            {editorMode === BridgeEditorMode.FIELDS_EDITOR ? (
              <TextFields />
            ) : (
              <LibraryBooks />
            )}
          </Button>
        </Box>

        {editorMode === BridgeEditorMode.FIELDS_EDITOR && (
          <FormEditor
            value={config ?? {}}
            onChange={onChange}
            schema={schema}
            customValidate={validatePort}
          />
        )}

        {editorMode === BridgeEditorMode.JSON_EDITOR && (
          <JsonEditor
            value={config ?? {}}
            onChange={onChange}
            schema={schema}
            customValidate={validatePort}
          />
        )}

        <Grid container>
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={props.onCancel}
              disabled={isSaving}
            >
              {t("common.cancel")}
            </Button>
          </Grid>
          <Grid size={{ xs: 0, sm: 4, md: 6 }} sx={muiStyles.desktopOnly} />
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              disabled={!isValid || isSaving}
              loading={isSaving}
              onClick={saveAction}
            >
              {t("common.save")}
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};
