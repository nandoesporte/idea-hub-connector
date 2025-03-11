
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here would be the API call to register
      // For now we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Conta criada com sucesso!");
      navigate('/dashboard');
      
    } catch (error) {
      toast.error("Ocorreu um erro ao criar sua conta. Por favor, tente novamente.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout className="max-w-md mx-auto animate-fade-in">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Crie sua conta</h1>
          <p className="text-muted-foreground">
            Registre-se para começar a transformar suas ideias em realidade
          </p>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="João Silva"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
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
              <Label htmlFor="password">Senha</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="text-xs text-muted-foreground">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              .
            </div>
            
            <Button 
              type="submit" 
              className="w-full shadow-sm" 
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;
