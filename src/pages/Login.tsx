
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here would be the API call to login
      // For now we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Login realizado com sucesso!");
      navigate('/dashboard');
      
    } catch (error) {
      toast.error("Ocorreu um erro ao fazer login. Por favor, verifique suas credenciais.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout className="max-w-md mx-auto animate-fade-in">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">
            Entre com sua conta para acessar seus projetos
          </p>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full shadow-sm" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 hover:underline">
              Crie uma agora
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
