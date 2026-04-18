import { Box, Button } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useEquipmentUpsert } from "../../hooks/intranet/useEquipmentUpsert";
import { ErrorAlert, LoadingState, PageHeader } from "../common";
import { EquipmentForm } from "./EquipmentForm";

export function EquipmentEditView({
  equipmentIdParam,
}: {
  equipmentIdParam: string;
}) {
  const equipmentId = Number(equipmentIdParam);
  const invalidId = Number.isNaN(equipmentId) || equipmentId < 1;

  const {
    categories,
    brands,
    warehouses,
    update,
    form,
    handleSubmitForm,
    isLoading,
    isDetailError,
    isDetailMissing,
  } = useEquipmentUpsert(invalidId ? {} : { equipmentId });

  if (invalidId) {
    return <ErrorAlert message="Invalid equipment ID." sx={{ mb: 2 }} />;
  }

  if (isLoading) {
    return <LoadingState message="Loading equipment…" />;
  }

  if (isDetailError || isDetailMissing) {
    return (
      <Box>
        <PageHeader
          title="Edit equipment"
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
        <ErrorAlert
          message="Equipment was not found or could not be loaded."
          sx={{ mb: 2 }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit equipment"
        subtitle={`Update details for equipment #${equipmentId}.`}
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
        categories={categories.data}
        brands={brands.data}
        warehouses={warehouses}
        onSubmit={handleSubmitForm}
        isPending={update.isPending}
        submitLabel="Save changes"
        SubmitIcon={Save}
        cancelTo="/intranet/equipment"
      />
    </Box>
  );
}
