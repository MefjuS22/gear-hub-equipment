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
import { usePostApiAuthLogin } from "../api/generated/react-query";
import { useAuth } from "../providers/AuthProvider";
import { formatApiErrorForDisplay, parseApiError } from "../lib/apiError";
import { HomeLayout } from "../ui/shells/HomeLayout";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: (raw) => searchSchema.parse(raw),
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { setSession, isAuthenticated } = useAuth();

  const registerSearch =
    redirectTo && redirectTo.startsWith("/") ? { redirect: redirectTo } : {};

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = usePostApiAuthLogin({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: (data) => {
        setSession(data);
        enqueueSnackbar("Signed in.", { variant: "success" });
        const target =
          redirectTo && redirectTo.startsWith("/") ? redirectTo : "/portal";
        void navigate({ to: target });
      },
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const target =
      redirectTo && redirectTo.startsWith("/") ? redirectTo : "/portal";
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
        <Card variant="outlined" sx={{ width: "100%", maxWidth: 420 }}>
          <CardContent
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use your GearHub staff account. Need an account?{" "}
              <Link to="/register" search={registerSearch}>
                <MuiLink component="span">
                  Create one
                </MuiLink>
              </Link>
              .
            </Typography>
            <Box
              component="form"
              onSubmit={form.handleSubmit((values) => {
                login.mutate({
                  data: { email: values.email, password: values.password },
                });
              })}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                fullWidth
                error={Boolean(form.formState.errors.email)}
                helperText={form.formState.errors.email?.message}
                {...form.register("email")}
              />
              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                fullWidth
                error={Boolean(form.formState.errors.password)}
                helperText={form.formState.errors.password?.message}
                {...form.register("password")}
              />
              {login.isError ? (
                <Alert severity="error">
                  {formatApiErrorForDisplay(parseApiError(login.error))}
                </Alert>
              ) : null}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={login.isPending}
                startIcon={
                  login.isPending ? <CircularProgress size={18} /> : null
                }
              >
                {login.isPending ? "Signing in…" : "Sign in"}
              </Button>
              <Button component={Link} to="/" variant="text" color="inherit">
                Back to home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </HomeLayout>
  );
}
