import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Pencil } from "lucide-react";

import type { PortalTextDto } from "../../api/generated/types";
import { usePortalTextsAdmin } from "../../hooks/intranet/usePortalTextsAdmin";
import { resolvePortalTextBodyHtml } from "../../lib/portalTextDefaults";
import { portalTextPlain } from "../../lib/portalTextHtml";
import { EmptyState, LoadingState, PageHeader, TablePaginationBar } from "../common";
import { PortalTextsSectionNav } from "./PortalTextsSectionNav";

export function PortalStaticTextsListView() {
  const { list, items, page, setPage, pageSize, setPageSize, totalCount } =
    usePortalTextsAdmin();
  const navigate = useNavigate();

  if (list.isLoading) {
    return <LoadingState message="Loading portal texts…" />;
  }

  const rows = items;

  return (
    <Box>
      <PageHeader
        title="Portal content"
        subtitle="Edit customer-facing copy for the catalog, cart, and news pages."
      />
      <PortalTextsSectionNav />

      {rows.length === 0 ? (
        <EmptyState
          title="No portal texts"
          description="Restart the API to seed default portal copy blocks."
          icon={FileText}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Placement</TableCell>
                <TableCell>Preview</TableCell>
                <TableCell align="right" width={120} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <PortalStaticTextRow
                  key={row.key}
                  row={row}
                  onEdit={(key) => {
                    void navigate({
                      to: "/intranet/portal-texts/static/edit",
                      search: { key },
                    });
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePaginationBar
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}

function PortalStaticTextRow({
  row,
  onEdit,
}: {
  row: PortalTextDto;
  onEdit: (key: string) => void;
}) {
  const preview = portalTextPlain(
    resolvePortalTextBodyHtml(row.key ?? "", row.bodyHtml),
  );
  return (
    <TableRow>
      <TableCell>{row.title}</TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {row.placementHint}
        </Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 280 }}>
        <Typography variant="body2" noWrap title={preview}>
          {preview}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Button
          size="small"
          variant="outlined"
          disabled={!row.key}
          startIcon={<Pencil size={16} aria-hidden />}
          onClick={() => {
            if (!row.key) return;
            onEdit(row.key);
          }}
        >
          Edit
        </Button>
      </TableCell>
    </TableRow>
  );
}
