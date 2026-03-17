import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, BadgeCheck, Gavel, User } from 'lucide-react';

const roleConfig = {
  tenant: {
    label: 'Tenant',
    color: 'bg-noir-accent_primary/20 text-noir-accent_primary border-noir-accent_primary/50',
    icon: User,
  },
  landlord: {
    label: 'Landlord',
    color: 'bg-noir-accent_warning/20 text-noir-accent_warning border-noir-accent_warning/50',
    icon: Shield,
  },
  dao_member: {
    label: 'Juror',
    color: 'bg-noir-accent_secondary/20 text-noir-accent_secondary border-noir-accent_secondary/50',
    icon: Gavel,
  },
  admin: {
    label: 'Platform Admin',
    color: 'bg-noir-accent_danger/20 text-noir-accent_danger border-noir-accent_danger/50',
    icon: ShieldAlert,
  },
  verified: {
    label: 'Verified',
    color: 'bg-noir-accent_success/10 text-noir-accent_success border-noir-accent_success/30',
    icon: BadgeCheck,
  }
};

export const RoleBadge = ({ role, className, showIcon = true }) => {
  const config = roleConfig[role];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm",
        config.color,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};
