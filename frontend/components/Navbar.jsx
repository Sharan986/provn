'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, Zap, LogOut, User, LayoutDashboard,
  Search, Compass, Trophy, Briefcase, GraduationCap,
  Shield, Building2, Crown
} from 'lucide-react';
import Badge from './Badge';
import Button from './Button';
import { getCurrentUser, signOut } from '@/lib/actions/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Check auth status
    getCurrentUser().then((usr) => {
      if (mounted) {
        if (usr) {
          setUser(usr);
          setRole(usr.profile?.role || 'student');
        } else {
          setUser(null);
          setRole(null);
        }
        setAuthChecked(true);
      }
    }).catch(() => {
      if (mounted) {
        setUser(null);
        setRole(null);
        setAuthChecked(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  const isLanding = pathname === '/';
  const isAuth = pathname === '/auth';
  const isSimulator = pathname === '/simulator';
  const isDashboard = pathname.startsWith('/dashboard');
  const isLoggedIn = !!user;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const dashboardPath = `/dashboard/${role || 'student'}`;

  const navLinks = isLoggedIn ? [
    { href: dashboardPath, label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: Briefcase },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/marketplace', label: 'Jobs', icon: Building2 },
    { href: '/simulator', label: 'Simulator', icon: Zap },
    ...(user?.profile?.subscription_tier === 'pro' ? [] : [{ href: '/pricing', label: 'Pricing', icon: Crown }]),
  ] : [];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-lime border-2 border-black shadow-brutal-sm flex items-center justify-center group-hover:translate-x-px group-hover:translate-y-px group-hover:shadow-none transition-all">
              <Zap size={16} className="text-black" />
            </div>
            <span className="heading-brutal text-xl tracking-tighter">PROVN</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-1.5 px-3 py-2
                    font-mono text-xs font-bold uppercase tracking-wider
                    transition-all border-2
                    ${isActive
                      ? 'bg-lime border-black shadow-brutal-sm'
                      : 'border-transparent hover:border-black hover:bg-bg-dark'
                    }
                  `}
                >
                  <Icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions — hidden until auth check completes to prevent flash */}
          <div className="hidden md:flex items-center gap-3">
            {!authChecked ? null : isLoggedIn ? (
              <>
                {user?.profile?.subscription_tier !== 'pro' && (
                  <Link href="/pricing">
                    <Badge variant="purple" size="sm">PRO</Badge>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs font-bold uppercase border-2 border-transparent hover:border-black hover:bg-bg-dark transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                {!isAuth && (
                  <>
                    <Link href="/pricing">
                      <Button variant="purple" size="sm" icon={Crown}>Pricing</Button>
                    </Link>
                    <Link href="/auth?mode=login">
                      <Button variant="outline" size="sm">Log In</Button>
                    </Link>
                    <Link href="/auth?mode=register">
                      <Button variant="primary" size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 border-brutal shadow-brutal-sm hover-press cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t-2 border-black bg-white animate-fade-in pb-4">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-2 px-4 py-3
                    font-mono text-sm font-bold uppercase
                    border-b border-black/10
                    ${isActive ? 'bg-lime' : 'hover:bg-bg-dark'}
                  `}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
            <div className="px-4 pt-3 flex flex-col gap-2">
              {!authChecked ? null : isLoggedIn ? (
                <Button variant="dark" size="sm" fullWidth icon={LogOut} onClick={handleSignOut}>
                  Logout
                </Button>
              ) : !isAuth && (
                <>
                  <Link href="/auth?mode=login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>Log In</Button>
                  </Link>
                  <Link href="/auth?mode=register" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

