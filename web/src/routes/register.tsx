import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gearhubApiClientOptions } from "../api/clientOptions";
import { usePostApiAuthRegister } from "../api/generated/react-query";
import { useAuth } from "../providers/AuthProvider";
import { formatApiErrorForDisplay, parseApiError } from "../lib/apiError";
import { HomeLayout } from "../ui/shells/HomeLayout";

const registerSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  displayName: z.string().min(1, "Name is required").max(200),
});

type RegisterForm = z.infer<typeof registerSchema>;

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/register")({
  validateSearch: (raw) => searchSchema.parse(raw),
  component: RegisterPage,
});

function RegisterPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { setSession, isAuthenticated } = useAuth();

  const loginSearch =
    redirectTo && redirectTo.startsWith("/") ? { redirect: redirectTo } : {};

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  const registerMutation = usePostApiAuthRegister({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: (data) => {
        setSession(data);
        enqueueSnackbar("Account created. You are signed in.", {
          variant: "success",
        });
        const target =
          redirectTo && redirectTo.startsWith("/") ? redirectTo : "/intranet";
        void navigate({ to: target });
      },
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const target =
      redirectTo && redirectTo.startsWith("/") ? redirectTo : "/intranet";
    void navigate({ to: target });
  }, [isAuthenticated, redirectTo, navigate]);

  return (
    <HomeLayout>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Card variant="outlined" sx={{ width: "100%", maxWidth: 480 }}>
          <CardContent
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Signing up creates a staff account with the standard{" "}
              <strong>User</strong> role. Already have an account?{" "}
              <Link to="/login" search={loginSearch}>
                <MuiLink>Sign in</MuiLink>
              </Link>
              .
            </Typography>
            <Box
              component="form"
              onSubmit={form.handleSubmit((values) => {
                registerMutation.mutate({
                  data: {
                    email: values.email,
                    password: values.password,
                    displayName: values.displayName,
                  },
                });
              })}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Display name"
                fullWidth
                error={Boolean(form.formState.errors.displayName)}
                helperText={form.formState.errors.displayName?.message}
                {...form.register("displayName")}
              />
              <TextField
                label="Email"
                type="text"
                autoComplete="email"
                fullWidth
                error={Boolean(form.formState.errors.email)}
                helperText={form.formState.errors.email?.message}
                {...form.register("email")}
              />
              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                fullWidth
                error={Boolean(form.formState.errors.password)}
                helperText={form.formState.errors.password?.message}
                {...form.register("password")}
              />
              {registerMutation.isError ? (
                <Alert severity="error">
                  {formatApiErrorForDisplay(
                    parseApiError(registerMutation.error),
                  )}
                </Alert>
              ) : null}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={registerMutation.isPending}
                startIcon={
                  registerMutation.isPending ? (
                    <CircularProgress size={18} />
                  ) : null
                }
              >
                {registerMutation.isPending ? "Creating…" : "Create account"}
              </Button>
              <Link to="/login" search={loginSearch} style={{ width: "100%" }}>
                <Button variant="text" color="inherit" fullWidth>
                  Back to sign in
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </HomeLayout>
  );
}
