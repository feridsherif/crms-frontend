"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerForm } from '../forms/customer-schema';
import { apiFetch } from '@/lib/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  closeDialog: () => void;
  customer?: (CustomerForm & { id?: number }) | null;
  onSaved?: () => void;
};

export default function CustomerEditDialog({ open, closeDialog, customer, onSaved }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CustomerForm>({ name: customer?.name ?? '', notes: customer?.notes ?? '', phone: customer?.phone ?? '' });

  useEffect(() => {
    setForm({ name: customer?.name ?? '', notes: customer?.notes ?? '', phone: customer?.phone ?? '' });
  }, [customer]);

  const saveMutation = useMutation({
    mutationFn: async (payload: CustomerForm) => {
      const url = customer?.id ? `/api/customers/${customer.id}` : '/api/customers';
      const method = customer?.id ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed to save customer');
      }
      return res.json();
    },
    onSuccess: () => {
      try { queryClient.invalidateQueries({ queryKey: ['customers'] }); } catch {}
      toast.success(customer ? 'Customer updated' : 'Customer created');
      closeDialog();
      if (onSaved) onSaved();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || 'Failed to save customer');
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
          <DialogTitle>{customer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <label>Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Notes</label>
          <Input value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
