
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, informe seu email.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error("Ocorreu um erro ao enviar o email de recuperação.");
        console.error(error);
        return;
      }
      
      setSubmitted(true);
      toast.success("Email de recuperação enviado com sucesso!");
      
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar o email de recuperação.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <MainLayout className="max-w-md mx-auto animate-fade-in">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Verifique seu email</h1>
            <p className="text-muted-foreground">
              Enviamos um link de recuperação para {email}. Verifique sua caixa de entrada (e sua pasta de spam) para redefinir sua senha.
            </p>
          </div>
          
          <Button asChild>
            <Link to="/login">Voltar para login</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout className="max-w-md mx-auto animate-fade-in">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Esqueceu sua senha?</h1>
          <p className="text-muted-foreground">
            Não se preocupe, enviaremos um link para você redefinir sua senha
          </p>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full shadow-sm" 
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar link de recuperação"}
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

export default ForgotPassword;
