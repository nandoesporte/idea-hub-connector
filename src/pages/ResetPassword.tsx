
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the password recovery hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type !== 'recovery') {
      toast.error("Link de recuperação inválido.");
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error("Ocorreu um erro ao redefinir sua senha.");
        console.error(error);
        return;
      }
      
      toast.success("Senha redefinida com sucesso!");
      navigate('/login');
      
    } catch (error) {
      toast.error("Ocorreu um erro ao redefinir sua senha.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout className="max-w-md mx-auto animate-fade-in">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Redefinir Senha</h1>
          <p className="text-muted-foreground">
            Crie uma nova senha para sua conta
          </p>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full shadow-sm" 
              disabled={isLoading}
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Lembrou sua senha?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 hover:underline">
              Voltar para login
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPassword;
