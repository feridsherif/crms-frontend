'use client';

import { usePathname } from 'next/navigation';
import { DropdownMenu2 } from '@/partials/dropdown-menu/dropdown-menu-2';
import { ChatSheet } from '@/partials/topbar/chat-sheet';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import { ChevronDown, MessageCircleMore, MessageSquareDot } from 'lucide-react';
// import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    <div className="flex items-center gap-2 lg:gap-3.5 lg:w-[400px] justify-end">
      {(pathname || '').startsWith('/store-client') ? (
        <StoreClientTopbar />
      ) : (
        <>
          <div className="flex items-center gap-2 me-0.5">
            <ChatSheet
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  shape="circle"
                  className="hover:bg-transparent hover:[&_svg]:text-primary"
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
                  shape="circle"
                  className="hover:bg-transparent hover:[&_svg]:text-primary"
                >
                  <MessageSquareDot className="size-4.5!" />
                </Button>
              }
            />

            <UserDropdownMenu
              trigger={
                <Avatar className="ms-2.5 size-9 rounded-full border-2 border-success shrink-0 cursor-pointer">
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

          <div className="border-e border-border h-5"></div>

          <div className="flex items-center space-x-2">
            <Switch id="auto-update" size="sm" defaultChecked />
            <Label htmlFor="auto-update">Pro</Label>
          </div>

          <div className="border-e border-border h-5"></div>

          <DropdownMenu2
            trigger={
              <Button variant="mono">
                Create
                <ChevronDown />
              </Button>
            }
          />
        </>
      )}
    </div>
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
