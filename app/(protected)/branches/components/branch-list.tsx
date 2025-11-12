"use client";

import { useMemo, useState, useEffect } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid, DataGridApiFetchParams, DataGridApiResponse } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
// data-grid helpers are not required here; using react-query + react-table directly
import { apiFetch } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import BranchEditDialog from './branch-edit-dialog';
import { BranchForm } from '../forms/branch-schema';
import BranchDeleteDialog from './branch-delete-dialog';

type Branch = BranchForm & { branchId?: number };

export default function BranchList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);

  const fetchBranches = async (p: DataGridApiFetchParams): Promise<DataGridApiResponse<Branch>> => {
    const { pageIndex, pageSize, sorting, searchQuery: q } = p;
    const sortField = sorting?.[0]?.id || '';
    const sortDirection = sorting?.[0]?.desc ? 'desc' : 'asc';

    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(pageSize),
      ...(sortField ? { sort: String(sortField), dir: sortDirection } : {}),
      ...(q ? { query: q } : {}),
    });

    const res = await apiFetch(`/api/branches?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();

    // Ensure data array
    const items: Branch[] = Array.isArray(json?.data) ? json.data : json?.data ?? [];
    const total = json?.pagination?.total ?? items.length;
    const page = json?.pagination?.page ?? (pageIndex + 1);

    // normalize branchId -> id if needed (ui may expect branchId)
    items.forEach((it) => {
      if (!('branchId' in it) && 'id' in it) (it as Branch).branchId = (it as unknown as { id?: number }).id;
    });

    return { data: items, empty: items.length === 0, pagination: { total, page } };
  };

  const columns = useMemo<ColumnDef<Branch>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => <DataGridColumnHeader title="Name" column={column} visibility />,
        cell: ({ getValue }) => <div>{String(getValue() ?? '')}</div>,
      },
      {
        accessorKey: 'address',
        id: 'address',
        header: ({ column }) => <DataGridColumnHeader title="Address" column={column} visibility />,
        cell: ({ getValue }) => <div>{String(getValue() ?? '')}</div>,
      },
      {
        accessorKey: 'phone',
        id: 'phone',
        header: ({ column }) => <DataGridColumnHeader title="Phone" column={column} visibility />,
        cell: ({ getValue }) => <div>{String(getValue() ?? '')}</div>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div className="flex gap-2">
              <Button onClick={() => { setEditingBranch(b); setEditOpen(true); }}>Edit</Button>
              <Button variant="destructive" onClick={() => { setDeletingBranchId(b.branchId ?? null); setDeleteOpen(true); }}>Delete</Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  // Query data from server using react-query
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['branches', pagination, sorting, searchQuery],
    queryFn: () =>
      fetchBranches({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        searchQuery,
      }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Create react-table instance
  const table = useReactTable({
    columns,
    data: data?.data || [],
    pageCount: Math.ceil((data?.pagination.total || 0) / pagination.pageSize) || -1,
    getRowId: (row: Branch) => String(row.branchId ?? ''),
    state: { pagination, sorting },
    enableRowSelection: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  useEffect(() => {
    // refetch when searchQuery changes and reset to first page
    setPagination({ ...pagination, pageIndex: 0 });
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Search />
            <Input placeholder="Search branches" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => { setEditingBranch(null); setEditOpen(true); }}><Plus /> Add Branch</Button>
        </CardHeader>

  <DataGrid table={table} recordCount={data?.pagination?.total ?? 0} isLoading={isFetching}>
          <div className="p-4 overflow-auto">
            <DataGridTable />
          </div>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </DataGrid>
      </Card>

      <BranchEditDialog open={editOpen} closeDialog={() => setEditOpen(false)} branch={editingBranch} onSaved={() => table.reset()} />
      <BranchDeleteDialog open={deleteOpen} closeDialog={() => setDeleteOpen(false)} branchId={deletingBranchId} onDeleted={() => table.reset()} />
    </>
  );
}
