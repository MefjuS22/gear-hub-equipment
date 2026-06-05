import { Box, type SxProps, type Theme } from "@mui/material";

import { portalTextSafeHtml } from "../../lib/portalTextHtml";

type PortalHtmlBlockProps = {
  html: string;
  sx?: SxProps<Theme>;
};

export function PortalHtmlBlock({ html, sx }: PortalHtmlBlockProps) {
  const safe = portalTextSafeHtml(html);
  if (!safe.trim()) {
    return null;
  }

  return (
    <Box
      sx={[
        {
          color: "text.secondary",
          "& p": { margin: 0, marginBottom: "0.5em" },
          "& p:last-child": { marginBottom: 0 },
          "& a": { color: "primary.main" },
        },
        ...(sx !== undefined ? [sx] : []),
      ]}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
