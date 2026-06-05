import {
  createFileRoute,
  type SearchSchemaInput,
} from "@tanstack/react-router";

import {
  type CatalogSearchInput,
  parseCatalogSearch,
} from "../../lib/catalogSearch";
import { PortalCatalogView } from "../../ui/portal/PortalCatalogView";

export const Route = createFileRoute("/portal/")({
  validateSearch: (raw: CatalogSearchInput & SearchSchemaInput) =>
    parseCatalogSearch(raw),
  component: PortalCatalogView,
});
