
import React from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { LogOut, User } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium">{user.user_metadata.name || user.email}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default UserProfile;
