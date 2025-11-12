'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  closeDialog: () => void;
  customerId: number | string | null;
  onDeleted?: () => void;
};

export default function CustomerDeleteDialog({ open, closeDialog, customerId, onDeleted }: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error('No customer id');
      const res = await apiFetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Delete failed');
      }
      return res.json();
    },
    onSuccess: () => {
      try { queryClient.invalidateQueries({ queryKey: ['customers'] }); } catch {}
      toast.success('Customer deleted');
      closeDialog();
      if (onDeleted) onDeleted();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || 'Failed to delete customer');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete customer</DialogTitle>
        </DialogHeader>

        <p>Are you sure you want to delete this customer?</p>

        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
