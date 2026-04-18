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
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { formatUsd } from "../../lib/formatCurrency";
import { useEquipmentAdmin } from "../../hooks/intranet/useEquipmentAdmin";
import { LoadingState, PageHeader } from "../common";

export function EquipmentAdminView() {
  const { equipment, remove } = useEquipmentAdmin();

  if (equipment.isLoading) {
    return <LoadingState message="Loading equipment…" />;
  }

  return (
    <Box>
      <PageHeader
        title="Equipment inventory"
        subtitle="Manage and track your active rental fleet across warehouses."
        actions={
          <Button
            component={Link}
            to="/intranet/equipment/new"
            variant="containedBlack"
            startIcon={<PlusCircle size={18} aria-hidden />}
          >
            Add equipment
          </Button>
        }
      />
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Daily rate</TableCell>
              <TableCell>Available</TableCell>
              <TableCell align="right" width={200} />
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment.data?.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                <TableCell>{e.name}</TableCell>
                <TableCell align="right">
                  {e.dailyRate != null ? formatUsd(e.dailyRate) : "—"}
                </TableCell>
                <TableCell>{e.isAvailable ? "yes" : "no"}</TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "inline-flex",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      component={Link}
                      to={
                        e.id != null
                          ? `/intranet/equipment/${e.id}/edit`
                          : "/intranet/equipment"
                      }
                      size="small"
                      variant="outlined"
                      startIcon={<Pencil size={16} aria-hidden />}
                      disabled={e.id == null}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<Trash2 size={16} aria-hidden />}
                      onClick={() =>
                        e.id != null && remove.mutate({ id: e.id })
                      }
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
