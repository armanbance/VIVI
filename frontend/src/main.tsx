import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "./index.css";
import App from "./App.tsx";

const root = createRoot(document.getElementById("root")!);

root.render(
  <Auth0Provider
    domain="dev-lbx2xhvbgeorijxd.us.auth0.com"
    clientId="SpRvVeZtxc4gPTMDcPArC27JaEBR9MEQ"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>
);
