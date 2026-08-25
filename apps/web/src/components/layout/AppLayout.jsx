import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { visibleSections, ROLES } from '@/lib/roles';
import { notifications } from '@/lib/mockData';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LOGO_URL, APP_NAME, APP_SYSTEM } from '@/lib/brand';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';

const toneDot = {
  red: 'bg-red-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
};

function SidebarNav({ onNavigate }) {
  const { user } = useAuth();
  const role = user?.role ?? 'viewer';
  const sections = visibleSections(role);

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <div className="rounded-md bg-white px-2 py-1.5">
        <img
          src={LOGO_URL}
          alt={`${APP_NAME} logo`}
          className="h-9 w-auto max-w-[10.5rem] object-contain object-left"
        />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] font-medium leading-snug text-zinc-400">{APP_SYSTEM}</p>
      </div>
    </div>
  );
}

function UserCard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-2">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-violet-600/20 text-xs font-semibold text-violet-300">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-white">{user?.name ?? 'Staff User'}</p>
          <p className="truncate text-[11px] text-zinc-500">{ROLES[user?.role] ?? 'Viewer'}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-zinc-900 lg:flex">
        <Brand />
        <SidebarNav />
        <UserCard />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col bg-zinc-900 p-0">
          <Brand />
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
          <UserCard />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-white px-4 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" strokeWidth={1.8} />
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="relative hidden w-full max-w-md sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.8} />
            <Input
              placeholder="Search programmes, POs, invoices…"
              className="h-9 bg-slate-50 pl-9 text-sm"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-slate-600" strokeWidth={1.8} />
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
                    {notifications.length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className="flex items-start gap-3 py-2.5">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneDot[n.tone]}`} />
                    <span className="flex-1">
                      <span className="block text-sm leading-snug text-slate-700">{n.text}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">{n.time}</span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-violet-100 text-xs font-semibold text-violet-700">
                      {(user?.name ?? 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-medium text-slate-800">{user?.name ?? 'Staff User'}</span>
                    <span className="block text-[11px] text-slate-500">{ROLES[user?.role] ?? 'Viewer'}</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block text-sm">{user?.name}</span>
                  <span className="block text-xs font-normal text-slate-500">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" /> Profile (demo)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
