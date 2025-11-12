'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';

type Props = {
  open: boolean;
  closeDialog: () => void;
  branchId: number | string | null;
  onDeleted?: () => void;
};

export default function BranchDeleteDialog({ open, closeDialog, branchId, onDeleted }: Props) {
  const handleDelete = async () => {
    if (!branchId) return;
    try {
      const res = await apiFetch(`/api/system/branches/${branchId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      closeDialog();
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error(err);
    }
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
