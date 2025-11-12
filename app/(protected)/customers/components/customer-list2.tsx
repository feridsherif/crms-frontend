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
import { apiFetch } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import CustomerEditDialog from './customer-edit-dialog';
import { CustomerForm } from '../forms/customer-schema';
import CustomerDeleteDialog from './customer-delete-dialog';

type Customer = CustomerForm & { id?: number };

export default function CustomerList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);

  const fetchCustomers = async (p: DataGridApiFetchParams): Promise<DataGridApiResponse<Customer>> => {
    const { pageIndex, pageSize, sorting, searchQuery: q } = p;
    const sortField = sorting?.[0]?.id || '';
    const sortDirection = sorting?.[0]?.desc ? 'desc' : 'asc';

    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(pageSize),
      ...(sortField ? { sort: String(sortField), dir: sortDirection } : {}),
      ...(q ? { query: q } : {}),
    });

    const res = await apiFetch(`/api/customers?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();

    const items: Customer[] = Array.isArray(json?.data) ? json.data : json?.data ?? [];
    const total = json?.pagination?.total ?? items.length;
    const page = json?.pagination?.page ?? (pageIndex + 1);

    return { data: items, empty: items.length === 0, pagination: { total, page } };
  };

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => <DataGridColumnHeader title="Name" column={column} visibility />,
        cell: ({ getValue }) => <div>{String(getValue() ?? '')}</div>,
      },
      {
        accessorKey: 'notes',
        id: 'notes',
        header: ({ column }) => <DataGridColumnHeader title="Notes" column={column} visibility />,
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
          const c = row.original;
          return (
            <div className="flex gap-2">
              <Button onClick={() => { setEditingCustomer(c); setEditOpen(true); }}>Edit</Button>
              <Button variant="destructive" onClick={() => { setDeletingCustomerId(c.id ?? null); setDeleteOpen(true); }}>Delete</Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['customers', pagination, sorting, searchQuery],
    queryFn: () =>
      fetchCustomers({
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

  const table = useReactTable({
    columns,
    data: data?.data || [],
    pageCount: Math.ceil((data?.pagination.total || 0) / pagination.pageSize) || -1,
    // Ensure row ids are unique even when backend item id is missing.
    // Use the provided index as a fallback so keys won't be empty/duplicated.
    getRowId: (row: Customer, index: number) => String(row.id ?? `row-${index}`),
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
            <Input placeholder="Search customers" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => { setEditingCustomer(null); setEditOpen(true); }}><Plus /> Add Customer</Button>
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

      <CustomerEditDialog open={editOpen} closeDialog={() => setEditOpen(false)} customer={editingCustomer} onSaved={() => table.reset()} />
      <CustomerDeleteDialog open={deleteOpen} closeDialog={() => setDeleteOpen(false)} customerId={deletingCustomerId} onDeleted={() => table.reset()} />
    </>
  );
}
