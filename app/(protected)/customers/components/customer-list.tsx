export { default } from './customer-list2';
      const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
      const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);

      const fetchCustomers = async (p: DataGridApiFetchParams): Promise<DataGridApiResponse<Customer>> => {
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
            export { default } from './customer-list2';
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
