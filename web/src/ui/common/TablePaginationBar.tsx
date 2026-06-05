import { TablePagination } from "@mui/material";

import { PAGE_SIZE_OPTIONS } from "../../lib/pagination";

type TablePaginationBarProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  rowsPerPageOptions?: readonly number[];
};

export function TablePaginationBar({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  rowsPerPageOptions = PAGE_SIZE_OPTIONS,
}: TablePaginationBarProps) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <TablePagination
      component="div"
      count={totalCount}
      page={page}
      onPageChange={(_, nextPage) => onPageChange(nextPage)}
      rowsPerPage={pageSize}
      onRowsPerPageChange={(e) => onPageSizeChange(Number(e.target.value))}
      rowsPerPageOptions={[...rowsPerPageOptions]}
    />
  );
}
