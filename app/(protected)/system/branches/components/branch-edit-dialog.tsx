'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BranchForm } from '../forms/branch-schema';
import { apiFetch } from '@/lib/api';

type Props = {
  open: boolean;
  closeDialog: () => void;
  branch?: (BranchForm & { branchId?: number }) | null;
  onSaved?: () => void;
};

export default function BranchEditDialog({ open, closeDialog, branch, onSaved }: Props) {
  const [form, setForm] = useState<BranchForm>({ name: branch?.name ?? '', address: branch?.address ?? '', phone: branch?.phone ?? '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = branch?.branchId ? `/api/system/branches/${branch.branchId}` : '/api/system/branches';
      const method = branch?.branchId ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed');
      closeDialog();
  if (onSaved) onSaved();
    } catch (err) {
      // simple error handling for now
      console.error(err);
    } finally {
      setSaving(false);
    }
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
