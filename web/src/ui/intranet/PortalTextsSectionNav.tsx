import { Tab, Tabs } from "@mui/material";
import { Link, useRouterState } from "@tanstack/react-router";

export function PortalTextsSectionNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onStatic = pathname.includes("/intranet/portal-texts/static");

  return (
    <Tabs value={onStatic ? "static" : "news"} sx={{ mb: 3 }}>
      <Tab
        label="News articles"
        value="news"
        component={Link}
        to="/intranet/portal-texts"
      />
      <Tab
        label="Portal texts"
        value="static"
        component={Link}
        to="/intranet/portal-texts/static"
      />
    </Tabs>
  );
}
