import {
  type CoverDeviceAttributes,
  CoverDeviceState,
  type HomeAssistantEntityState,
} from "@ha-plus-matter-hub/common";
import type { Agent } from "@matter/main";
import { WindowCovering } from "@matter/main/clusters";
import { BridgeDataProvider } from "../../../../../services/bridges/bridge-data-provider.js";
import {
  type WindowCoveringConfig,
  WindowCoveringServer,
} from "../../../../behaviors/window-covering-server.js";

const attributes = (entity: HomeAssistantEntityState) =>
  <CoverDeviceAttributes>entity.attributes;

const adjustPosition = (position: number, agent: Agent) => {
  const { featureFlags } = agent.env.get(BridgeDataProvider);
  if (position == null) {
    return null;
  }
  let percentValue = position;
  if (featureFlags?.coverDoNotInvertPercentage !== true) {
    percentValue = 100 - percentValue;
  }
  return percentValue;
};

const positionForState = (
  position: number | null | undefined,
  state: string,
  agent: Agent,
) => {
  if (position != null) {
    return adjustPosition(position, agent);
  }
  // These are Matter positions, so they do not depend on the HA inversion setting.
  if (state === CoverDeviceState.open) return 0;
  if (state === CoverDeviceState.closed) return 100;
  return null;
};

const config: WindowCoveringConfig = {
  getCurrentLiftPosition: (entity, agent) =>
    positionForState(attributes(entity).current_position, entity.state, agent),
  getCurrentTiltPosition: (entity, agent) =>
    positionForState(
      attributes(entity).current_tilt_position,
      entity.state,
      agent,
    ),
  getMovementStatus: (entity) => {
    const coverState = entity.state as CoverDeviceState;
    return coverState === CoverDeviceState.opening
      ? WindowCovering.MovementStatus.Opening
      : coverState === CoverDeviceState.closing
        ? WindowCovering.MovementStatus.Closing
        : WindowCovering.MovementStatus.Stopped;
  },

  stopCover: () => ({ action: "cover.stop_cover" }),

  openCoverLift: () => ({ action: "cover.open_cover" }),
  closeCoverLift: () => ({ action: "cover.close_cover" }),
  setLiftPosition: (position, agent) => ({
    action: "cover.set_cover_position",
    data: { position: adjustPosition(position, agent) },
  }),

  openCoverTilt: () => ({ action: "cover.open_cover_tilt" }),
  closeCoverTilt: () => ({ action: "cover.close_cover_tilt" }),
  setTiltPosition: (position, agent) => ({
    action: "cover.set_cover_tilt_position",
    data: { tilt_position: adjustPosition(position, agent) },
  }),
};

export const CoverWindowCoveringServer = WindowCoveringServer(config);
