'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { AppsDropdownMenu } from '@/partials/topbar/apps-dropdown-menu';
import { ChatSheet } from '@/partials/topbar/chat-sheet';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import {
  LayoutGrid,
  MessageCircleMore,
  MessageSquareDot,
  Search,
  Users,
} from 'lucide-react';
// import { toAbsoluteUrl } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { StoreClientTopbar } from '@/app/(protected)/store-client/components/common/topbar';

export function HeaderTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = (session?.user as unknown) as
    | { avatar?: string; name?: string; username?: string; email?: string }
    | undefined;

  return (
    <div className="flex items-center gap-2 lg:gap-3.5">
      <>
        {(pathname || '').startsWith('/store-client') ? (
          <StoreClientTopbar />
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/account/members/team-members">
                <Users />
                Add <span className="hidden md:inline">Teammate</span>
              </Link>
            </Button>

            <div className="flex items-center gap-1">
              <SearchDialog
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="hover:bg-transparent hover:[&_svg]:text-primary"
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
                    className="hover:bg-transparent hover:[&_svg]:text-primary"
                  >
                    <MessageCircleMore className="size-4.5!" />
                  </Button>
                }
              />
              <AppsDropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="hover:bg-transparent hover:[&_svg]:text-primary"
                  >
                    <LayoutGrid className="size-4.5!" />
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
            </div>

            <UserDropdownMenu
              trigger={
                <Avatar className="cursor-pointer size-9 rounded-full border-2 border-mono/25 shrink-0">
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
          </>
        )}
      </>
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
