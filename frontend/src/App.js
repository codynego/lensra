import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import MainPlatformRoutes from "./routes/MainPlatformRoutes";
import PublicSiteRoutes from "./routes/PublicSiteRoutes";
import { getSubdomain } from "./utils/getSubdomain"; // Utility to get subdomain

const App = () => {
  const subdomain = getSubdomain();
  const isMainSite = !subdomain;
  console.log("Subdomain:", subdomain, "Is Main Site:", isMainSite);

  return (
    <AuthProvider>
      <Router>
        {isMainSite ? (
          <MainPlatformRoutes />
        ) : (
          <PublicSiteRoutes subdomain={subdomain} />
        )}
      </Router>
    </AuthProvider>
  );
};

export default App;
