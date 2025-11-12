"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BranchForm } from '../forms/branch-schema';
import { apiFetch } from '@/lib/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  closeDialog: () => void;
  branch?: (BranchForm & { branchId?: number }) | null;
  onSaved?: () => void;
};

export default function BranchEditDialog({ open, closeDialog, branch, onSaved }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BranchForm>({ name: branch?.name ?? '', address: branch?.address ?? '', phone: branch?.phone ?? '' });

  useEffect(() => {
    // keep local form in sync when editing different branch
    setForm({ name: branch?.name ?? '', address: branch?.address ?? '', phone: branch?.phone ?? '' });
  }, [branch]);

  const saveMutation = useMutation({
    mutationFn: async (payload: BranchForm) => {
      const url = branch?.branchId ? `/api/branches/${branch.branchId}` : '/api/branches';
      const method = branch?.branchId ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed to save branch');
      }
      return res.json();
    },
    onSuccess: () => {
      try {
        queryClient.invalidateQueries({ queryKey: ['branches'] });
      } catch {}
      toast.success(branch ? 'Branch updated' : 'Branch created');
      closeDialog();
      if (onSaved) onSaved();
    },
    onError: (err: unknown) => {
      const msg = (err instanceof Error ? err.message : String(err)) || 'Failed to save branch';
      toast.error(msg);
    },
  });

  const saving = saveMutation.status === 'pending';

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{branch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <label>Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Address</label>
          <Input value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <label>Phone</label>
          <Input value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
