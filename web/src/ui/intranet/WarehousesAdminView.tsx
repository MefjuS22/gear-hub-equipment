import {
  Box,
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
import { Warehouse } from "lucide-react";
import { useWarehousesAdmin } from "../../hooks/intranet/useWarehousesAdmin";
import { EmptyState } from "../common";

export function WarehousesAdminView() {
  const { list } = useWarehousesAdmin();
  const rows = list.data ?? [];

  if (list.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Warehouses
      </Typography>
      {rows.length === 0 ? (
        <EmptyState
          title="Coming soon"
          description="Warehouse details will appear here once available."
          icon={Warehouse}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.name}</TableCell>
                  <TableCell>{w.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
