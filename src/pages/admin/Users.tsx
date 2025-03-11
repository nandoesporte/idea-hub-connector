
import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Shield, UserCog, UserMinus, Mail } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for users
const mockUsers = [
  { 
    id: '1', 
    name: 'João Silva', 
    email: 'joao.silva@example.com', 
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-01-15')
  },
  { 
    id: '2', 
    name: 'Maria Oliveira', 
    email: 'maria.oliveira@example.com', 
    role: 'admin',
    status: 'active',
    createdAt: new Date('2023-02-10')
  },
  { 
    id: '3', 
    name: 'Carlos Santos', 
    email: 'carlos.santos@example.com', 
    role: 'user',
    status: 'inactive',
    createdAt: new Date('2023-03-22')
  },
  { 
    id: '4', 
    name: 'Ana Pereira', 
    email: 'ana.pereira@example.com', 
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-04-05')
  },
  { 
    id: '5', 
    name: 'Pedro Costa', 
    email: 'pedro.costa@example.com', 
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-05-18')
  }
];

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePromoteToAdmin = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: 'admin' } : user
    ));
    toast.success('Usuário promovido para administrador.');
  };

  const handleRemoveAdmin = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: 'user' } : user
    ));
    toast.success('Privilégios de administrador removidos.');
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'}.`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários e permissões do sistema.
          </p>
        </div>

        <div className="flex justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>Novo Usuário</Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Total de {filteredUsers.length} usuários registrados no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                          <Shield className="h-3 w-3 mr-1" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">Usuário</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'success' : 'secondary'} className={user.status === 'active' ? 'bg-green-500' : ''}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.createdAt.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => toast.info('Enviando email...')}>
                            <Mail className="mr-2 h-4 w-4" /> Enviar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                            <UserCog className="mr-2 h-4 w-4" /> 
                            {user.status === 'active' ? 'Desativar Usuário' : 'Ativar Usuário'}
                          </DropdownMenuItem>
                          {user.role === 'admin' ? (
                            <DropdownMenuItem onClick={() => handleRemoveAdmin(user.id)}>
                              <UserMinus className="mr-2 h-4 w-4" /> Remover Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handlePromoteToAdmin(user.id)}>
                              <Shield className="mr-2 h-4 w-4" /> Promover a Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
