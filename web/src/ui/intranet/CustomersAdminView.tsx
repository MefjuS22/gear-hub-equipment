import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Download, Users } from "lucide-react";
import { useState } from "react";
import type { Customer } from "../../api/generated/types";
import { useCustomersAdmin } from "../../hooks/intranet/useCustomersAdmin";
import { downloadAuthenticatedFile } from "../../lib/downloadAuthenticatedFile";
import { EmptyState, PageHeader, TablePaginationBar } from "../common";

export function CustomersAdminView() {
  const { list, items, page, setPage, pageSize, setPageSize, totalCount } =
    useCustomersAdmin();
  const rows = items;
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      await downloadAuthenticatedFile({
        path: "/api/Customer/export/excel",
        fileName: `gearhub-customers-${stamp}.xlsx`,
      });
    } finally {
      setExportingExcel(false);
    }
  };

  if (list.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle="Company accounts that place rental orders."
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={16} aria-hidden />}
            disabled={exportingExcel || rows.length === 0}
            onClick={() => void handleExportExcel()}
          >
            Export Excel
          </Button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Coming soon"
          description="Customer management will appear here once available."
          icon={Users}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c: Customer) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.companyName}</TableCell>
                  <TableCell>{c.contactPerson}</TableCell>
                </TableRow>
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
