import type {
  BridgeDataWithMetadata,
  CreateBridgeRequest,
  UpdateBridgeRequest,
} from "@ha-plus-matter-hub/common";
import { expectJson, expectSuccess } from "./response.ts";

export async function fetchBridges() {
  const res = await fetch(`api/matter/bridges?_s=${Date.now()}`);
  return expectJson<BridgeDataWithMetadata[]>(res);
}

export async function createBridge(req: CreateBridgeRequest) {
  return expectJson<BridgeDataWithMetadata>(
    await fetch("api/matter/bridges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    }),
  );
}

export async function updateBridge(req: UpdateBridgeRequest) {
  return expectJson<BridgeDataWithMetadata>(
    await fetch(`api/matter/bridges/${req.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    }),
  );
}

export async function deleteBridge(bridgeId: string) {
  await expectSuccess(
    await fetch(`api/matter/bridges/${bridgeId}`, {
      method: "DELETE",
    }),
  );
}

export async function resetBridge(bridgeId: string) {
  return expectJson<BridgeDataWithMetadata>(
    await fetch(`api/matter/bridges/${bridgeId}/actions/factory-reset`, {
      method: "GET",
    }),
  );
}
