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
import { useWarehousesAdmin } from "../../hooks/intranet/useWarehousesAdmin";

export function WarehousesAdminView() {
  const { list } = useWarehousesAdmin();

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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        No warehouses endpoint in OpenAPI — below are unique warehouses inferred
        from equipment assignments (name + ID). Location is not available on the
        equipment DTO.
      </Typography>
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
            {list.data?.map((w) => (
              <TableRow key={w.id}>
                <TableCell>{w.id}</TableCell>
                <TableCell>{w.name}</TableCell>
                <TableCell>{w.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
