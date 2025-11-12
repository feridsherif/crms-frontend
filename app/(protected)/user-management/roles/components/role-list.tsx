'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Ellipsis,
  Plus,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import {
  DataGrid,
  DataGridApiFetchParams,
  DataGridApiResponse,
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '@/app/models/user';
import RoleDefaultDialog from './role-default-dialog';
import RoleDeleteDialog from './role-delete-dialog';
import RoleEditDialog from './role-edit-dialog';

const RoleList = () => {
  // List state management
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: true },
  ]);

  // Form state management
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [defaultDialogOpen, setDefaultDialogOpen] = useState(false);

  const [editRole, setEditRole] = useState<UserRole | null>(null);
  const [deleteRole, setDeleteRole] = useState<UserRole | null>(null);
  const defaultRoleState = useState<UserRole | null>(null);
  const defaultRole = defaultRoleState[0];
  const [viewPermissionsRole, setViewPermissionsRole] = useState<UserRole | null>(null);
  const [viewPermissionsOpen, setViewPermissionsOpen] = useState(false);
  const [viewPermissionNames, setViewPermissionNames] = useState<string[]>([]);
  const [viewPermissionsLoading, setViewPermissionsLoading] = useState(false);

  // When the permissions dialog opens, fetch the role details and read permissionNames
  useEffect(() => {
    if (!viewPermissionsOpen) {
      setViewPermissionNames([]);
      setViewPermissionsLoading(false);
      return;
    }

    const roleId = viewPermissionsRole?.id ?? viewPermissionsRole?.roleId;
    if (!roleId) {
      setViewPermissionNames([]);
      setViewPermissionsLoading(false);
      return;
    }

    let cancelled = false;
    const fetchRole = async () => {
      setViewPermissionsLoading(true);
      try {
        const res = await apiFetch(`/api/user-management/roles/${roleId}`);
        if (!res.ok) {
          setViewPermissionNames([]);
          return;
        }

        const json = await res.json();
        const role = json?.data ?? json;
        const names: string[] =
          role?.permissionNames ?? role?.permissions?.map((p: { name?: string }) => p.name ?? '') ?? [];

        if (!cancelled) setViewPermissionNames(names ?? []);
      } catch {
        if (!cancelled) setViewPermissionNames([]);
      } finally {
        if (!cancelled) setViewPermissionsLoading(false);
      }
    };

    fetchRole();

    return () => {
      cancelled = true;
    };
  }, [viewPermissionsOpen, viewPermissionsRole]);

  // Query state management
  const [searchQuery, setSearchQuery] = useState('');

  // Role list
  const { data, isLoading } = useQuery({
    queryKey: ['user-roles', pagination, sorting, searchQuery],
    queryFn: () =>
      fetchRoles({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        searchQuery,
      }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Fetch roles from the server API
  const fetchRoles = async ({
    pageIndex,
    pageSize,
    sorting,
    filters,
    searchQuery,
  }: DataGridApiFetchParams): Promise<DataGridApiResponse<UserRole>> => {
    const sortField = sorting?.[0]?.id || '';
    const sortDirection = sorting?.[0]?.desc ? 'desc' : 'asc';

    // Debug: log fetch parameters
    console.log('[RoleList] fetchRoles params:', {
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
      filters,
      searchQuery,
    });

    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(pageSize),
      ...(sortField ? { sort: sortField, dir: sortDirection } : {}),
      ...(searchQuery ? { query: searchQuery } : {}),
      ...Object.fromEntries((filters || []).map((f) => [f.id, String(f.value)])),
    });

    const url = `/api/user-management/roles?${params.toString()}`;
    console.log('[RoleList] requesting url:', url);

    const response = await apiFetch(url);
    console.log('[RoleList] response status:', response.status);

    if (!response.ok) {
      const text = await response.text().catch(() => null);
      console.log('[RoleList] response not ok body/text:', text);
      throw new Error(
        'Oops! Something didn’t go as planned. Please try again in a moment.',
      );
    }

    const json = await response.json();
    console.log('[RoleList] response body:', json);

    // Normalize role objects: ensure `id` exists (some backends return `roleId`)
    const items = (json?.data ?? json) as UserRole[] | undefined;
    if (Array.isArray(items)) {
      items.forEach((it) => {
        if (!('id' in it) && 'roleId' in it) it.id = it.roleId;
      });
    } else if (json && Array.isArray(json.data)) {
      (json.data as UserRole[]).forEach((it) => {
        if (!('id' in it) && 'roleId' in it) it.id = it.roleId;
      });
    }

    return json;
  };

  // Table settings
  const columns = useMemo<ColumnDef<UserRole>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader title="Role" column={column} visibility />
        ),
        cell: ({ row, getValue }) => {
          const value = getValue() as string;
          const isProtected = row.original.isProtected;
          const isDefault = row.original.isDefault;

          return (
            <div className="flex items-center flex-wrap gap-2">
              {value}
              {isProtected && (
                <Badge appearance="stroke">
                  <ShieldAlert className="text-destructive" />
                  system
                </Badge>
              )}
              {isDefault && (
                <Badge appearance="stroke">
                  <UserRound className="text-success" />
                  default
                </Badge>
              )}
            </div>
          );
        },
        size: 200,
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerTitle: 'Role',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
      },
      {
        accessorKey: 'description',
        id: 'description',
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} visibility />
        ),
        size: 200,
        cell: (info) => {
          const value = info.getValue() as string;

          return <span className="truncate">{value}</span>;
        },
        enableSorting: false,
        enableHiding: true,
        meta: {
          headerTitle: 'Description',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
      },
      // permissions column removed — permissions are now viewed from the actions menu
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-7 w-7" mode="icon" variant="ghost">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
              <DropdownMenuItem
                onClick={() => {
                  setViewPermissionsRole(row.original);
                  setViewPermissionsOpen(true);
                }}
              >
                View permissions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEditRole(row.original);
                  setEditDialogOpen(true);
                }}
              >
                Edit role
              </DropdownMenuItem>
              {/* 'Set as default' removed per request */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={row.original.isProtected}
                onClick={() => {
                  setDeleteRole(row.original);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete role
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 75,
        enableSorting: false,
        enableResizing: false,
        meta: {
          skeleton: <Skeleton className="size-5" />,
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: data?.data || [],
    pageCount: Math.ceil((data?.pagination.total || 0) / pagination.pageSize),
  getRowId: (row: UserRole) => row.id ?? row.roleId,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const DataGridToolbar = () => {
    const [inputValue, setInputValue] = useState(searchQuery);

    const handleSearch = () => {
      setSearchQuery(inputValue);
      setPagination({ ...pagination, pageIndex: 0 });
    };

    return (
      <CardHeader className="py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search users"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
              className="ps-9 w-full md:w-64"
            />
            {searchQuery.length > 0 && (
              <Button
                mode="icon"
                variant="dim"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            disabled={isLoading && true}
            onClick={() => {
              setEditRole(null);
              setEditDialogOpen(true);
            }}
          >
            <Plus />
            Add Role
          </Button>
        </div>
      </CardHeader>
    );
  };

  return (
    <>
      <DataGrid
        table={table}
        recordCount={data?.pagination.total || 0}
        isLoading={isLoading}
        tableLayout={{
          columnsResizable: true,
          columnsPinnable: true,
          columnsMovable: true,
        }}
        tableClassNames={{
          edgeCell: 'px-5',
        }}
      >
        <Card>
          <DataGridToolbar />
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <RoleEditDialog
        open={editDialogOpen}
        closeDialog={() => setEditDialogOpen(false)}
        role={editRole}
      />

      {deleteRole && (
        <RoleDeleteDialog
          open={deleteDialogOpen}
          closeDialog={() => setDeleteDialogOpen(false)}
          role={deleteRole}
        />
      )}

      {defaultRole && (
        <RoleDefaultDialog
          open={defaultDialogOpen}
          closeDialog={() => setDefaultDialogOpen(false)}
          role={defaultRole}
        />
      )}

      {/* View permissions dialog */}
      <Dialog
        open={viewPermissionsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setViewPermissionsOpen(false);
            setViewPermissionsRole(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Role permissions</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <ScrollArea className="h-64">
              <ul className="space-y-2 p-2">
                {viewPermissionsLoading && (
                  <li className="text-sm text-muted-foreground">Loading permissions…</li>
                )}

                {!viewPermissionsLoading && viewPermissionNames.length === 0 && (
                  <li className="text-sm text-muted-foreground">No permissions found for this role.</li>
                )}

                {!viewPermissionsLoading && viewPermissionNames.map((name) => (
                  <li key={name} className="flex items-center justify-between">
                    <div className="truncate">{name}</div>
                    <Badge appearance="stroke">{name}</Badge>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setViewPermissionsOpen(false);
                setViewPermissionsRole(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoleList;
