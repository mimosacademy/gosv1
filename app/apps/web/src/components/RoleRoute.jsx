import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess, ROLES } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function RoleRoute({ path, children }) {
  const { user } = useAuth();
  const role = user?.role ?? 'viewer';

  if (!canAccess(role, path)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldX className="h-7 w-7 text-red-500" strokeWidth={1.8} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900">Access restricted</h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Your role ({ROLES[role] ?? role}) does not have permission to view this module. Contact a
          Super Admin if you believe this is a mistake.
        </p>
        <Button asChild className="mt-6 bg-violet-600 hover:bg-violet-700">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return children;
}
