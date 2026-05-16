import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Pencil, PlusCircle, ShieldUser, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { UserAdminListDto } from "../../api/generated/types";
import { useUsersAdmin } from "../../hooks/intranet/useUsersAdmin";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";
import { AppRoles } from "../../lib/appRoles";
import {
  createStaffUserFormSchema,
  type CreateStaffUserFormValues,
  setStaffUserRolesFormSchema,
  type SetStaffUserRolesFormValues,
} from "../../lib/formSchemas";
import { useAuth } from "../../providers/AuthProvider";
import { EmptyState, ErrorAlert, LoadingState, PageHeader } from "../common";

function rolesToFlags(roles: string[]): SetStaffUserRolesFormValues {
  return {
    admin: roles.some(
      (r) => r.toLowerCase() === AppRoles.Admin.toLowerCase(),
    ),
    user: roles.some((r) => r.toLowerCase() === AppRoles.User.toLowerCase()),
  };
}

function flagsToRoles(flags: {
  admin: boolean;
  user: boolean;
}): string[] {
  const r: string[] = [];
  if (flags.admin) {
    r.push(AppRoles.Admin);
  }
  if (flags.user) {
    r.push(AppRoles.User);
  }
  return r;
}

function roleSorter(a: string, b: string) {
  const rank = (x: string) =>
    x.toLowerCase() === AppRoles.Admin.toLowerCase() ? 0 : 1;
  return rank(a) - rank(b) || a.localeCompare(b);
}

export function UsersAdminView() {
  const { user: currentUser } = useAuth();
  const { list, create, setRoles, remove } = useUsersAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const [rolesUser, setRolesUser] = useState<UserAdminListDto | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserAdminListDto | null>(null);

  const createForm = useForm<CreateStaffUserFormValues>({
    resolver: zodResolver(createStaffUserFormSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      admin: false,
      user: true,
    },
  });

  const rolesForm = useForm<SetStaffUserRolesFormValues>({
    resolver: zodResolver(setStaffUserRolesFormSchema),
    defaultValues: { admin: false, user: true },
  });

  const openRoles = (row: UserAdminListDto) => {
    rolesForm.reset(rolesToFlags(row.roles ?? []));
    setRolesUser(row);
  };

  const openCreate = () => {
    createForm.reset({
      email: "",
      password: "",
      displayName: "",
      admin: false,
      user: true,
    });
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
  };

  const closeRoles = () => {
    setRolesUser(null);
  };

  const closeDelete = () => {
    setDeleteUser(null);
  };

  const confirmDelete = () => {
    const id = deleteUser?.id;
    if (id == null) {
      return;
    }
    remove.mutate({ id }, { onSuccess: () => closeDelete() });
  };

  const pending = create.isPending || setRoles.isPending || remove.isPending;

  const onCreateSubmit = createForm.handleSubmit((values) => {
    create.mutate(
      {
        data: {
          email: values.email.trim(),
          password: values.password,
          displayName: values.displayName.trim(),
          roles: flagsToRoles(values),
        },
      },
      { onSuccess: () => closeCreate() },
    );
  });

  const onRolesSubmit = rolesForm.handleSubmit((values) => {
    const id = rolesUser?.id;
    if (id == null) {
      return;
    }
    setRoles.mutate(
      { id, data: { roles: flagsToRoles(values) } },
      { onSuccess: () => closeRoles() },
    );
  });

  if (list.isLoading) {
    return <LoadingState message="Loading users…" />;
  }

  if (list.isError) {
    return (
      <Box>
        <PageHeader
          title="Users"
          subtitle="Create staff accounts and assign Admin or User roles."
        />
        <ErrorAlert
          message={formatApiErrorForDisplay(parseApiError(list.error))}
        />
      </Box>
    );
  }

  const rows = list.data ?? [];

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Create staff accounts and assign Admin or User roles. Only admins can manage users."
        actions={
          <Button
            variant="containedBlack"
            startIcon={<PlusCircle size={18} aria-hidden />}
            onClick={openCreate}
          >
            Add user
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No users"
          description="Add a staff member with an email, password, and roles."
          icon={ShieldUser}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Display name</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell align="right" width={220} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelf = row.id === currentUser?.id;
                const sortedRoles = [...(row.roles ?? [])].sort(roleSorter);
                return (
                  <TableRow key={row.id ?? row.email}>
                    <TableCell>{row.email ?? "—"}</TableCell>
                    <TableCell>{row.displayName ?? "—"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {sortedRoles.map((r) => (
                          <Chip key={r} label={r} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
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
                          size="small"
                          variant="outlined"
                          startIcon={<Pencil size={16} aria-hidden />}
                          disabled={pending || row.id == null}
                          onClick={() => openRoles(row)}
                        >
                          Roles
                        </Button>
                        <Tooltip
                          title={
                            isSelf
                              ? "You cannot delete your own account."
                              : ""
                          }
                        >
                          <span>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<Trash2 size={16} aria-hidden />}
                              disabled={pending || isSelf || row.id == null}
                              onClick={() => setDeleteUser(row)}
                            >
                              Delete
                            </Button>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={createOpen}
        onClose={() => !pending && closeCreate()}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>New user</DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            void onCreateSubmit();
          }}
        >
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Controller
              name="email"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  autoFocus
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Password"
                  type="password"
                  required
                  fullWidth
                  margin="dense"
                  autoComplete="new-password"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="displayName"
              control={createForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Display name"
                  required
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Box sx={{ pt: 0.5 }}>
              <FormLabel component="legend">Roles</FormLabel>
              <FormGroup sx={{ mt: 0.5 }}>
                <Controller
                  name="admin"
                  control={createForm.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!field.value}
                          onChange={(_, v) => field.onChange(v)}
                          ref={field.ref}
                          name={field.name}
                          onBlur={field.onBlur}
                        />
                      }
                      label="Admin (full staff access)"
                    />
                  )}
                />
                <Controller
                  name="user"
                  control={createForm.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!field.value}
                          onChange={(_, v) => field.onChange(v)}
                          ref={field.ref}
                          name={field.name}
                          onBlur={field.onBlur}
                        />
                      }
                      label="User (standard staff)"
                    />
                  )}
                />
              </FormGroup>
              {createForm.formState.errors.admin?.message && (
                <Typography variant="caption" color="error" component="p">
                  {createForm.formState.errors.admin.message}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => closeCreate()} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" variant="containedBlack" disabled={pending}>
              Create
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={rolesUser != null}
        onClose={() => !pending && closeRoles()}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Roles for {rolesUser?.email ?? "…"}
        </DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            void onRolesSubmit();
          }}
        >
          <DialogContent>
            <FormLabel component="legend">Roles</FormLabel>
            <FormGroup sx={{ mt: 1 }}>
              <Controller
                name="admin"
                control={rolesForm.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!field.value}
                        onChange={(_, v) => field.onChange(v)}
                        ref={field.ref}
                        name={field.name}
                        onBlur={field.onBlur}
                      />
                    }
                    label="Admin"
                  />
                )}
              />
              <Controller
                name="user"
                control={rolesForm.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!field.value}
                        onChange={(_, v) => field.onChange(v)}
                        ref={field.ref}
                        name={field.name}
                        onBlur={field.onBlur}
                      />
                    }
                    label="User"
                  />
                )}
              />
            </FormGroup>
            {rolesForm.formState.errors.admin?.message && (
              <Typography variant="caption" color="error" component="p" sx={{ mt: 1 }}>
                {rolesForm.formState.errors.admin.message}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => closeRoles()} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" variant="containedBlack" disabled={pending}>
              Save roles
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={deleteUser != null}
        onClose={() => !pending && closeDelete()}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <Typography>
            Remove{" "}
            <strong>{deleteUser?.email ?? deleteUser?.displayName ?? "this user"}</strong>
            ? This cannot be undone. Users with rental orders cannot be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => closeDelete()} disabled={pending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={pending || deleteUser?.id == null}
            onClick={() => confirmDelete()}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
