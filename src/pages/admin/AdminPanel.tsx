
import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminPanel = () => {
  return (
    <AdminLayout title="Painel Administrativo" description="Gerencie todos os aspectos da plataforma">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao painel administrativo</CardTitle>
            <CardDescription>Gerencie usuários, projetos e configurações</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Utilize o menu lateral para navegar entre as diferentes seções do painel administrativo.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;
