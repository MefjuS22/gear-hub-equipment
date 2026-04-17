import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useCustomersAdmin } from "../../hooks/intranet/useCustomersAdmin";

export function CustomersAdminView() {
  const { list } = useCustomersAdmin();

  if (list.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Customers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The API only exposes a customers list (GET) — create/delete would need backend support.
      </Typography>
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
            {list.data?.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.companyName}</TableCell>
                <TableCell>{c.contactPerson}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
