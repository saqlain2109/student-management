import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Master Courses', path: '/courses', icon: BookOpen },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Fees Management', path: '/fees', icon: CreditCard },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card px-4 py-6 flex flex-col">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
          <span className="text-xl font-bold text-primary-foreground tracking-tighter">SM</span>
        </div>
        <div className="overflow-hidden">
          <h2 className="text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            St. Mary's
          </h2>
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 leading-tight">
            School & Jr. College
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t pt-4">
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
