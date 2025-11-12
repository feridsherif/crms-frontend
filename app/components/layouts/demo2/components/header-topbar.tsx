"use client";

import { usePathname } from 'next/navigation';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { ChatSheet } from '@/partials/topbar/chat-sheet';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import { MessageCircleMore, MessageSquareDot, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreClientTopbar } from '@/app/(protected)/store-client/components/common/topbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';

export function HeaderTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = (session?.user as unknown) as
    | { avatar?: string; name?: string; username?: string; email?: string }
    | undefined;

  return (
    <>
      {(pathname || '').startsWith('/store-client') ? (
        <StoreClientTopbar />
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <SearchDialog
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  shape="circle"
                  className="size-9"
                >
                  <Search className="size-4.5!" />
                </Button>
              }
            />
            <ChatSheet
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  shape="circle"
                  className="size-9"
                >
                  <MessageCircleMore className="size-4.5!" />
                </Button>
              }
            />
            <NotificationsSheet
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  shape="circle"
                  className="size-9"
                >
                  <MessageSquareDot className="size-4.5!" />
                </Button>
              }
            />
          </div>
          <UserDropdownMenu
            trigger={
              <Avatar className="cursor-pointer size-9 rounded-full justify-center border border-gray-500 shrink-0">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name ?? ''} />
                ) : (
                  <AvatarFallback className="text-sm">
                    {getInitials(user?.username || user?.name || user?.email || '')}
                  </AvatarFallback>
                )}
              </Avatar>
            }
          />
        </div>
      )}
    </>
  );
}

function getInitials(name: string, max = 2): string {
  if (!name) return '';
  const parts = name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0].slice(0, max).toUpperCase();
  }
  const initials = [parts[0][0], parts[parts.length - 1][0]];
  return initials.slice(0, max).join('').toUpperCase();
}
