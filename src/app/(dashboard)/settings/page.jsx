'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitials } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import { User, Building2, Lock, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const profile = useAuthStore((state) => state.profile);
  const tenant = useAuthStore((state) => state.tenant);
  const { isAdmin } = useRole();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [tenantName, setTenantName] = useState(tenant?.name || '');

  const handleProfileSave = () => {
    toast.success('Profile updated successfully');
  };

  const handleTenantSave = () => {
    toast.success('Tenant settings updated');
  };

  const handlePasswordChange = () => {
    toast.success('Password changed successfully');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and workspace preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="tenant" className="gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Organization
            </TabsTrigger>
          )}
          <TabsTrigger value="password" className="gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Password
          </TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {ROLE_LABELS[profile?.role]}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Form */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="opacity-60"
                  />
                </div>
              </div>

              <Button onClick={handleProfileSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tenant tab */}
        {isAdmin && (
          <TabsContent value="tenant">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization Settings</CardTitle>
                <CardDescription>Manage your organization details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tenant?.name}</p>
                    <p className="text-xs text-muted-foreground">slug: {tenant?.slug}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tenantName">Organization Name</Label>
                    <Input
                      id="tenantName"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantSlug">Slug</Label>
                    <Input id="tenantSlug" value={tenant?.slug || ''} disabled className="opacity-60" />
                  </div>
                </div>

                <Button onClick={handleTenantSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Password tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button onClick={handlePasswordChange}>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
