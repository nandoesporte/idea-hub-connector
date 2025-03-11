
import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Shield, UserCog, UserMinus, Mail, Plus, UserPlus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Mock data for users
const mockUsers: User[] = [
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
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Omit<User, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePromoteToAdmin = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: 'admin' as const } : user
    ));
    toast.success('Usuário promovido para administrador.');
  };

  const handleRemoveAdmin = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: 'user' as const } : user
    ));
    toast.success('Privilégios de administrador removidos.');
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' as const : 'active' as const;
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'}.`);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'user',
      status: 'active'
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('Usuário excluído com sucesso.');
    }
  };

  const handleSaveUser = () => {
    // Validate form
    if (!userForm.name.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }
    
    if (!userForm.email.trim()) {
      toast.error('O email é obrigatório');
      return;
    }

    if (!userForm.email.includes('@')) {
      toast.error('Email inválido');
      return;
    }

    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser.id ? { ...user, ...userForm } : user
      ));
      toast.success('Usuário atualizado com sucesso.');
    } else {
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...userForm,
        createdAt: new Date()
      };
      setUsers([...users, newUser]);
      toast.success('Usuário criado com sucesso.');
    }

    setShowUserModal(false);
  };

  const sendEmail = (email: string) => {
    // In a real application, this would trigger an email sending process
    toast.success(`Email será enviado para ${email}`);
  };

  return (
    <AdminLayout
      title="Gerenciamento de Usuários"
      description="Gerencie os usuários e permissões do sistema."
      actionLabel="Novo Usuário"
      onAction={handleCreateUser}
    >
      <div className="space-y-6">
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
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => sendEmail(user.email)}>
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
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Create/Edit Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Edite as informações do usuário.' : 'Preencha os campos para criar um novo usuário.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Função</Label>
                  <Select
                    value={userForm.role}
                    onValueChange={(value: 'user' | 'admin') => setUserForm({...userForm, role: value})}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecionar função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={userForm.status}
                    onValueChange={(value: 'active' | 'inactive') => setUserForm({...userForm, status: value})}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserModal(false)}>Cancelar</Button>
              <Button onClick={handleSaveUser}>{editingUser ? 'Salvar alterações' : 'Criar usuário'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
