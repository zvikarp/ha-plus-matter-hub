import { collectionLayoutStyles } from "@ha-plus/ui/collections";
import { useLocalizer } from "@ha-plus/ui/react";
import Add from "@mui/icons-material/Add";
import HubOutlined from "@mui/icons-material/HubOutlined";
import { useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useMatch,
  useNavigate,
  useOutletContext,
} from "react-router";
import { useBridges } from "../hooks/data/bridges.ts";
import { navigation } from "../routes.tsx";
import { loadBridges } from "../state/bridges/bridge-actions.ts";
import { useAppDispatch } from "../state/hooks.ts";
import { AppFooter } from "../theme/AppFooter.tsx";
import messages from "../translations/en.json";

export const AppPage = () => {
  const t = useLocalizer(messages);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { embedded = false } = useOutletContext<{ embedded?: boolean }>() || {};
  const { content: bridges } = useBridges();
  const match = useMatch("/bridges/:bridgeId/*");
  const selected = bridges?.find(
    (bridge) => bridge.id === match?.params.bridgeId,
  );

  useEffect(() => {
    dispatch(loadBridges());
  }, [dispatch]);

  const createButton = () => (
    <Link className="ha-plus-create-button" to={navigation.createBridge}>
      <Add fontSize="small" />
      {t("create_new_bridge")}
    </Link>
  );

  return (
    <div
      className={`ha-plus-collection-layout${embedded ? " ha-plus-embedded" : ""}`}
    >
      <style>{collectionLayoutStyles}</style>
      <nav className="ha-plus-collection-nav" aria-label={t("bridges")}>
        <div className="ha-plus-collection-items">
          <h2>{t("bridges")}</h2>
          {bridges?.map((bridge) => (
            <NavLink
              className="ha-plus-collection-item"
              to={navigation.bridge(bridge.id)}
              key={bridge.id}
            >
              <HubOutlined />
              <span className="ha-plus-collection-name">{bridge.name}</span>
              <span className="ha-plus-collection-count">
                {bridge.deviceCount}
              </span>
            </NavLink>
          ))}
        </div>
        <div className="ha-plus-collection-create">{createButton()}</div>
      </nav>
      <div className="ha-plus-collection-body">
        <div className="ha-plus-collection-mobile">
          {!!bridges?.length && (
            <>
              <label htmlFor="bridge-navigation">{t("bridges")}</label>
              <select
                id="bridge-navigation"
                value={selected?.id || ""}
                onChange={(event) => {
                  if (event.target.value)
                    navigate(navigation.bridge(event.target.value));
                }}
              >
                <option value="" disabled>
                  {t("choose_bridge")}
                </option>
                {bridges.map((bridge) => (
                  <option key={bridge.id} value={bridge.id}>
                    {bridge.name}
                  </option>
                ))}
              </select>
            </>
          )}
          {createButton()}
        </div>
        <main className="ha-plus-collection-content">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
};
