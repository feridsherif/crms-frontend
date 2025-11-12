'use client';

import { ReactNode, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function SearchDialog({ trigger }: { trigger: ReactNode }) {
  const [searchInput, setSearchInput] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="lg:max-w-[600px] lg:top-[15%] lg:translate-y-0 p-0 [&_[data-slot=dialog-close]]:top-5.5 [&_[data-slot=dialog-close]]:end-5.5">
        <DialogHeader className="px-4 py-1 mb-1">
          <DialogTitle>
            <span className="sr-only">Search</span>
          </DialogTitle>
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 size-4" />
            <Input
              type="text"
              name="query"
              value={searchInput}
              className="ps-6 outline-none! ring-0! shadow-none! border-0"
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search..."
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
