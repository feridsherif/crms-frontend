'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import BranchEditDialog from './branch-edit-dialog';
import { BranchForm } from '../forms/branch-schema';
import BranchDeleteDialog from './branch-delete-dialog';

export default function BranchList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<(BranchForm & { branchId?: number }) | null>(null);
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);

  const fetchBranches = async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    const res = await apiFetch(`/api/system/branches?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  const { data, isLoading, refetch } = useQuery({ queryKey: ['branches', searchQuery], queryFn: fetchBranches, staleTime: Infinity });

  useEffect(() => {
    // refetch when searchQuery changes
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const items = data ?? [];

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

        <div className="p-4 overflow-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-start">Name</th>
                <th className="text-start">Address</th>
                <th className="text-start">Phone</th>
                <th className="text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4}>Loading...</td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={4}>No branches found.</td>
                </tr>
              )}
              {!isLoading && items.map((b: BranchForm & { branchId?: number }) => (
                <tr key={b.branchId}>
                  <td>{b.name}</td>
                  <td>{b.address}</td>
                  <td>{b.phone}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button onClick={() => { setEditingBranch(b); setEditOpen(true); }}>Edit</Button>
                      <Button variant="destructive" onClick={() => { setDeletingBranchId(b.branchId ?? null); setDeleteOpen(true); }}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CardFooter>
          {/* pagination could be added later */}
        </CardFooter>
      </Card>

      <BranchEditDialog open={editOpen} closeDialog={() => setEditOpen(false)} branch={editingBranch} onSaved={() => refetch()} />
      <BranchDeleteDialog open={deleteOpen} closeDialog={() => setDeleteOpen(false)} branchId={deletingBranchId} onDeleted={() => refetch()} />
    </>
  );
}
