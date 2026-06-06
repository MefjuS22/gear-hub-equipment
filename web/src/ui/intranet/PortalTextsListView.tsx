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
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, Pencil, PlusCircle, Trash2 } from "lucide-react";
import type { CmsPostListDto } from "../../api/generated/types";
import { useCmsPostsAdmin } from "../../hooks/intranet/useCmsPostsAdmin";
import {
  EmptyState,
  LoadingState,
  PageHeader,
  TablePaginationBar,
} from "../common";
import { PortalTextsSectionNav } from "./PortalTextsSectionNav";

export function PortalTextsListView() {
  const {
    list,
    remove,
    items,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
  } = useCmsPostsAdmin();

  if (list.isLoading) {
    return <LoadingState message="Loading posts…" />;
  }

  const rows = items;

  return (
    <Box>
      <PageHeader
        title="Portal content"
        subtitle="News articles for the public site."
        actions={
          <Button
            component={Link}
            to="/intranet/portal-texts/new"
            variant="containedBlack"
            startIcon={<PlusCircle size={18} aria-hidden />}
          >
            New post
          </Button>
        }
      />
      <PortalTextsSectionNav />

      {rows.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Add your first article to show it on the public portal once published."
          icon={FileText}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Published</TableCell>
                <TableCell align="right" width={200} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <PortalTextsRow
                  key={row.id}
                  row={row}
                  onDelete={remove.mutate}
                />
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

function PortalTextsRow({
  row,
  onDelete,
}: {
  row: CmsPostListDto;
  onDelete: (args: { id: string }) => void;
}) {
  const navigate = useNavigate();
  return (
    <TableRow>
      <TableCell>{row.id}</TableCell>
      <TableCell>{row.title}</TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          /portal/news/{row.slug}
        </Typography>
      </TableCell>
      <TableCell>{row.isPublished ? "yes" : "draft"}</TableCell>
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
            disabled={!row.id}
            startIcon={<Pencil size={16} aria-hidden />}
            onClick={() => {
              if (!row.id) return;
              void navigate({
                to: "/intranet/portal-texts/$postId/edit",
                params: { postId: row.id },
              });
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<Trash2 size={16} aria-hidden />}
            disabled={!row.id}
            onClick={() => {
              if (!row.id) return;
              if (!window.confirm("Delete this post? This cannot be undone.")) {
                return;
              }
              onDelete({ id: row.id });
            }}
          >
            Delete
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
}
