import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ShieldAlert, Users, Home, Activity } from 'lucide-react';
import api from '@/lib/axios';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { formatDate } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      // Optimistic update
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 animate-pulse">Loading Platform Matrix...</div>;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-6">
        <ShieldAlert className="w-8 h-8 text-noir-accent_danger" />
        <div>
          <h1 className="text-3xl font-display font-bold">Platform Oversight</h1>
          <p className="text-muted-foreground">Global System Administration</p>
        </div>
      </div>

      {/* Global Stats Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.activeUsers || 0, icon: Users, color: 'text-primary' },
          { label: 'Total Properties', value: stats?.totalProperties || 0, icon: Home, color: 'text-noir-accent_primary' },
          { label: 'Global Reports', value: stats?.totalIssues || 0, icon: Activity, color: 'text-noir-accent_warning' },
          { label: 'DAO Cases', value: stats?.openCases || 0, icon: ShieldAlert, color: 'text-noir-accent_secondary' },
        ].map((stat, i) => (
          <Card key={i} className="bg-secondary/20">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-1`} />
              <span className="text-3xl font-mono font-bold">{stat.value}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory & Role Management</CardTitle>
          <CardDescription>Directly modify platform access schemas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Current Role</th>
                  <th className="px-4 py-3 rounded-tr-lg">Modify Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.displayName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-xs font-mono">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} showIcon={false} />
                    </td>
                    <td className="px-4 py-3 w-48">
                      <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="landlord">Landlord</SelectItem>
                          <SelectItem value="dao_member">Juror (DAO)</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
