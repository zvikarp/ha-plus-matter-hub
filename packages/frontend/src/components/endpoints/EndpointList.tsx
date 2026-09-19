import type { EndpointData } from "@ha-plus-matter-hub/common";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { PageMessage } from "../misc/PageState.tsx";
import { EndpointIcon } from "./EndpointIcon.tsx";
import { getEndpointName } from "./EndpointName.tsx";
import { EndpointState } from "./EndpointState.tsx";
import {
  filterDevices,
  friendlyDeviceType,
  listDevices,
} from "./endpoint-list-utils.ts";

export interface EndpointListProps {
  endpoint: EndpointData;
}

export const EndpointList = ({ endpoint }: EndpointListProps) => {
  const devices = useMemo(() => listDevices(endpoint), [endpoint]);
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<EndpointData>();
  const filteredDevices = useMemo(
    () => filterDevices(devices, query),
    [devices, query],
  );
  const groupedDevices = useMemo(() => {
    const groups = new Map<string, EndpointData[]>();
    for (const device of filteredDevices) {
      const type = friendlyDeviceType(device.type.name);
      groups.set(type, [...(groups.get(type) ?? []), device]);
    }
    return [...groups.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [filteredDevices]);

  useEffect(() => {
    if (
      !selectedItem ||
      !devices.some((item) => item.id.global === selectedItem.id.global)
    ) {
      setSelectedItem(devices[0]);
    }
  }, [devices, selectedItem]);

  if (devices.length === 0) {
    return (
      <PageMessage
        title="No exposed devices"
        message="Edit this bridge to include Home Assistant entities, then refresh the bridge."
      />
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Devices</Typography>
            <Typography variant="body2" color="text.secondary">
              {devices.length} exposed{" "}
              {devices.length === 1 ? "device" : "devices"}
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="Search devices"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Paper variant="outlined" sx={{ maxHeight: 560, overflow: "auto" }}>
            {groupedDevices.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{ p: 3, textAlign: "center" }}
              >
                No devices match “{query}”.
              </Typography>
            ) : (
              <List disablePadding aria-label="Exposed devices">
                {groupedDevices.map(([type, items]) => (
                  <Box component="li" key={type} sx={{ listStyle: "none" }}>
                    <ListSubheader>{type}</ListSubheader>
                    {items.map((device) => (
                      <ListItemButton
                        key={device.id.global}
                        selected={selectedItem?.id.global === device.id.global}
                        onClick={() => setSelectedItem(device)}
                      >
                        <ListItemIcon>
                          <EndpointIcon endpoint={device} />
                        </ListItemIcon>
                        <ListItemText
                          primary={getEndpointName(device)}
                          secondary={`Endpoint ${device.endpoint}`}
                        />
                      </ListItemButton>
                    ))}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Device details
        </Typography>
        {selectedItem ? (
          <EndpointState endpoint={selectedItem} />
        ) : (
          <Typography color="text.secondary">
            Select a device to inspect its Matter details.
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};
