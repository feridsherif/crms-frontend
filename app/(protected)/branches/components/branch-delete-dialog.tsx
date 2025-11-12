'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  closeDialog: () => void;
  branchId: number | string | null;
  onDeleted?: () => void;
};

export default function BranchDeleteDialog({ open, closeDialog, branchId, onDeleted }: Props) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!branchId) throw new Error('No branch id');
      const res = await apiFetch(`/api/branches/${branchId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Delete failed');
      }
      return res.json();
    },
    onSuccess: () => {
      try {
        queryClient.invalidateQueries({ queryKey: ['branches'] });
      } catch {}
      toast.success('Branch deleted');
      closeDialog();
      if (onDeleted) onDeleted();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || 'Failed to delete branch');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete branch</DialogTitle>
        </DialogHeader>

        <p>Are you sure you want to delete this branch?</p>

        <DialogFooter>
          <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
