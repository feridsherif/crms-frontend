'use client';

import { useState } from 'react';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@/app/models/user';
import UserProfileEditDialog from './user-profile-edit-dialog';

const UserProfile = ({
  user,
  isLoading,
}: {
  user: User;
  isLoading: boolean;
}) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const Loading = () => (
    <Card>
      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] text-muted-foreground gap-3 text-sm mb-5">
          <div className="grid grid-cols-subgrid col-span-2 items-baseline">
            <dt className="flex md:w-64">
              <Skeleton className="h-6 w-24" />
            </dt>
            <dd>
              <Skeleton className="h-5 w-36" />
            </dd>
          </div>
          <div className="grid grid-cols-subgrid col-span-2 items-baseline">
            <dt>
              <Skeleton className="h-5 w-36" />
            </dt>
            <dd>
              <Skeleton className="h-5 w-48" />
            </dd>
          </div>
          <div className="grid grid-cols-subgrid col-span-2 items-baseline">
            <dt>
              <Skeleton className="h-5 w-20" />
            </dt>
            <dd>
              <Skeleton className="h-5 w-24" />
            </dd>
          </div>
          <div className="grid grid-cols-subgrid col-span-2 items-baseline">
            <dt>
              <Skeleton className="h-5 w-24" />
            </dt>
            <dd>
              <Skeleton className="h-5 w-20" />
            </dd>
          </div>
          <div className="grid grid-cols-subgrid col-span-2 items-baseline">
            <dt>
              <Skeleton className="h-5 w-36" />
            </dt>
            <dd>
              <Skeleton className="h-5 w-24" />
            </dd>
          </div>
          <div className="grid grid-cols-subgrid col-span-2 items-baseline">
            <dt>
              <Skeleton className="h-5 w-24" />
            </dt>
            <dd>
              <Skeleton className="h-5 w-36" />
            </dd>
          </div>
        </dl>
        <Skeleton className="h-9 w-32" />
      </CardContent>
    </Card>
  );

  const Content = () => {
    return (
      <Card>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-3 text-sm mb-5 [&_dt]:text-muted-foreground">
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt className="flex md:w-64">Full name:</dt>
              <dd>{((user as unknown) as { username?: string; name?: string }).username ?? user.name ?? 'Not available'}</dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Email address:</dt>
              <dd className="flex items-center gap-2.5">
                <span>{user.email}</span>
                  <Badge variant="secondary" appearance="outline">
                    Verified
                  </Badge>
              </dd>
            </div>
            <div className="grid grid-cols-subgrid col-span-2 items-baseline">
              <dt>Roles:</dt>
              <dd>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    type RoleLike = { id?: string | number; name?: string; isProtected?: boolean };
                    const u = user as unknown as { roles?: RoleLike[]; role?: RoleLike; roleNames?: string[] };
                    if (Array.isArray(u.roles) && u.roles.length > 0) {
                      return u.roles.map((r) => (
                        <Badge key={r.id ?? r.name ?? String(r)}>
                          {r.name ?? String(r)}
                          {r.isProtected && <BadgeDot className="ml-2" />}
                        </Badge>
                      ));
                    }
                    if (u.role) {
                      return (
                        <span className="inline-flex items-center gap-1">
                          {u.role.name}
                          {u.role.isProtected && <Badge appearance="outline">System</Badge>}
                        </span>
                      );
                    }
                    if (Array.isArray(u.roleNames) && u.roleNames.length > 0) {
                      return u.roleNames.map((name) => <Badge key={name}>{name}</Badge>);
                    }
                    return <span className="text-muted-foreground">No roles assigned</span>;
                  })()}
                </div>
              </dd>
            </div>
          </dl>
          <Button
            variant="outline"
            disabled={user.role?.isProtected}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit user details
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {isLoading || !user ? <Loading /> : <Content />}

      <UserProfileEditDialog
        open={isEditDialogOpen}
        closeDialog={() => setEditDialogOpen(false)}
        user={user}
      />
    </>
  );
};

export default UserProfile;
