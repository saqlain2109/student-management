import { Search, Bell, User } from 'lucide-react';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const userEmail = user?.email || 'Admin User';
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-4">
        <div className="hidden md:block mr-4">
          <h1 className="text-sm font-bold text-slate-500 uppercase tracking-widest truncate">
            St. Mary's School & Jr. College
          </h1>
        </div>
        <form className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students, roll numbers..."
            className="w-full bg-muted/50 pl-9 md:w-[300px] lg:w-[400px]"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>
        
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium truncate max-w-[150px]">{userEmail.split('@')[0]}</span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
