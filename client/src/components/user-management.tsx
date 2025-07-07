import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LocalStorage } from '@/lib/storage';
import { User, NewUserFormData } from '@/lib/discord-types';
import { UserPlus, Users, Shield, User as UserIcon } from 'lucide-react';

interface UserManagementProps {
  onUserCreated: () => void;
}

export default function UserManagement({ onUserCreated }: UserManagementProps) {
  const [formData, setFormData] = useState<NewUserFormData>({
    name: '',
    password: '',
    role: 'user'
  });
  const [users, setUsers] = useState<Record<string, User>>(LocalStorage.getUsers());
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.password.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const username = formData.name.toLowerCase().replace(/\s+/g, '');
    
    // Verificar se usuário já existe
    if (users[username]) {
      toast({
        title: "Erro",
        description: "Usuário já existe",
        variant: "destructive"
      });
      return;
    }

    const newUser: User = {
      username: username,
      password: formData.password,
      role: formData.role
    };

    // Salvar usuário
    LocalStorage.addUser(username, newUser);
    
    // Atualizar estado local
    const updatedUsers = LocalStorage.getUsers();
    setUsers(updatedUsers);
    
    // Limpar formulário
    setFormData({
      name: '',
      password: '',
      role: 'user'
    });

    toast({
      title: "Sucesso",
      description: `Usuário ${username} criado com sucesso`,
      variant: "default"
    });

    onUserCreated();
  };

  const generatePassword = () => {
    const generated = Math.random().toString(36).slice(-10);
    setFormData({ ...formData, password: generated });
  };

  return (
    <div className="space-y-6">
      {/* Criar Usuário */}
      <Card className="bg-discord-dark border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <UserPlus className="mr-2" />
            Criar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">Nome</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-discord-secondary border-gray-600 text-white mt-2"
                placeholder="Nome do usuário"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                O username será gerado automaticamente baseado no nome
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Senha</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-discord-secondary border-gray-600 text-white"
                  placeholder="Senha do usuário"
                  required
                />
                <Button
                  type="button"
                  onClick={generatePassword}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Gerar
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Função</Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-discord-secondary border-gray-600 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-discord-secondary border-gray-600">
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit"
              className="w-full bg-discord-primary hover:bg-blue-600"
            >
              Criar Usuário
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card className="bg-discord-dark border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="mr-2" />
            Usuários Cadastrados ({Object.keys(users).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(users).map(([username, user]) => (
              <div key={username} className="flex items-center justify-between p-3 bg-discord-secondary rounded-lg">
                <div className="flex items-center">
                  {user.role === 'admin' ? (
                    <Shield className="w-5 h-5 text-discord-yellow mr-3" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <div className="text-white font-medium">{username}</div>
                    <div className="text-xs text-gray-400">
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Senha: {user.password}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}