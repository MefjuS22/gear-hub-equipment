import { Box, Button } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useEquipmentUpsert } from "../../hooks/intranet/useEquipmentUpsert";
import { LoadingState, PageHeader } from "../common";
import { EquipmentForm } from "./EquipmentForm";

export function EquipmentCreateView() {
  const {
    categories,
    brands,
    warehouses,
    create,
    form,
    handleSubmitForm,
    isLoading,
  } = useEquipmentUpsert();

  if (isLoading) {
    return <LoadingState message="Loading form…" />;
  }

  return (
    <Box>
      <PageHeader
        title="Add equipment"
        subtitle="Create a new rental unit and assign category, brand, warehouse, and pricing."
        actions={
          <Button
            component={Link}
            to="/intranet/equipment"
            variant="outlined"
            startIcon={<ArrowLeft size={18} aria-hidden />}
          >
            Back to list
          </Button>
        }
      />
      <EquipmentForm
        control={form.control}
        categories={categories.data?.items ?? undefined}
        brands={brands.data?.items ?? undefined}
        warehouses={warehouses}
        onSubmit={() => void handleSubmitForm()}
        isPending={create.isPending}
        submitLabel="Save equipment"
        SubmitIcon={PlusCircle}
        cancelTo="/intranet/equipment"
      />
    </Box>
  );
}
