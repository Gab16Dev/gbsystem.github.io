import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  DiscordEmbed, 
  TokenLog, 
  MessageLog, 
  EmbedFormData,
  PurchaseLog
} from '@/lib/discord-types';
import { LocalStorage } from '@/lib/storage';
import UserManagement from '@/components/user-management';
import { 
  Shield, 
  Edit, 
  Settings, 
  Palette, 
  Eye, 
  Info, 
  Key, 
  Mail, 
  Wrench,
  Trash2,
  Download,
  Plus,
  Send,
  LogOut,
  AlertTriangle,
  CheckCircle,
  X,
  CreditCard
} from 'lucide-react';

// Users will be loaded from LocalStorage

interface EmbedField {
  id: string;
  name: string;
  value: string;
}

export default function DiscordEmbedManager() {
  const [currentUser, setCurrentUser] = useState<(User & { username: string }) | null>(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState('embed');

  // Bot configuration
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [botChannelId, setBotChannelId] = useState('');

  // Embed data
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedDescription, setEmbedDescription] = useState('');
  const [embedColor, setEmbedColor] = useState('#5865F2');
  const [embedImage, setEmbedImage] = useState('');
  const [embedThumbnail, setEmbedThumbnail] = useState('');
  const [embedAuthor, setEmbedAuthor] = useState('');
  const [embedFooter, setEmbedFooter] = useState('');
  const [embedTimestamp, setEmbedTimestamp] = useState(false);
  const [embedFields, setEmbedFields] = useState<EmbedField[]>([]);

  // Logs
  const [tokenLogs, setTokenLogs] = useState<TokenLog[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [purchaseLogs, setPurchaseLogs] = useState<PurchaseLog[]>([]);
  
  // Users
  const [users, setUsers] = useState<Record<string, User>>({});
  
  // No longer needed - purchase flow moved to public home page

  const { toast } = useToast();

  // Load saved data on mount
  useEffect(() => {
    if (currentUser) {
      const savedData = LocalStorage.getEmbedFormData(currentUser.username);
      // Never auto-load sensitive fields for security
      if (savedData.embedTitle) setEmbedTitle(savedData.embedTitle);
      if (savedData.embedDescription) setEmbedDescription(savedData.embedDescription);
      if (savedData.embedColor) setEmbedColor(savedData.embedColor);
      if (savedData.embedImage) setEmbedImage(savedData.embedImage);
      if (savedData.embedThumbnail) setEmbedThumbnail(savedData.embedThumbnail);
      if (savedData.embedAuthor) setEmbedAuthor(savedData.embedAuthor);
      if (savedData.embedFooter) setEmbedFooter(savedData.embedFooter);
      if (savedData.embedTimestamp !== undefined) setEmbedTimestamp(savedData.embedTimestamp);

      // Load user-specific logs
      if (currentUser.role === 'admin') {
        // Admin can see all logs
        setTokenLogs(LocalStorage.getAllTokenLogs());
        setMessageLogs(LocalStorage.getAllMessageLogs());
      } else {
        // Regular users see only their own logs
        setTokenLogs(LocalStorage.getTokenLogs(currentUser.username));
        setMessageLogs(LocalStorage.getMessageLogs(currentUser.username));
      }
      
      setPurchaseLogs(LocalStorage.getPurchaseLogs());
      setUsers(LocalStorage.getUsers());
    }
  }, [currentUser]);

  // Auto-save form data (excluding sensitive fields)
  useEffect(() => {
    if (currentUser) {
      const formData: Partial<EmbedFormData> = {
        embedTitle,
        embedDescription,
        embedColor,
        embedImage,
        embedThumbnail,
        embedAuthor,
        embedFooter,
        embedTimestamp
        // Sensitive fields (botToken, channelId, botChannelId) are intentionally excluded for security
      };
      LocalStorage.setEmbedFormData(formData, currentUser.username);
    }
  }, [currentUser, embedTitle, embedDescription, embedColor, embedImage, embedThumbnail, embedAuthor, embedFooter, embedTimestamp]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUsers = LocalStorage.getUsers();
    const user = currentUsers[loginData.username];
    
    if (user && user.password === loginData.password) {
      // Verificar se o usuário tem acesso válido (comprou ou é admin padrão)
      const purchaseLogs = LocalStorage.getPurchaseLogs();
      const hasValidAccess = user.role === 'admin' || 
                            user.username === 'admin' || 
                            user.username === 'user1' || 
                            purchaseLogs.some(log => log.buyerName.toLowerCase().replace(/\s+/g, '') === user.username && log.status === 'approved');
      
      if (hasValidAccess) {
        setCurrentUser({ ...user, username: loginData.username });
        setLoginError(false);
        
        // Load user-specific logs
        if (user.role === 'admin') {
          setTokenLogs(LocalStorage.getAllTokenLogs());
          setMessageLogs(LocalStorage.getAllMessageLogs());
        } else {
          setTokenLogs(LocalStorage.getTokenLogs(loginData.username));
          setMessageLogs(LocalStorage.getMessageLogs(loginData.username));
        }
        setPurchaseLogs(LocalStorage.getPurchaseLogs());
        
        toast({
          title: "Login realizado",
          description: `Bem-vindo, ${user.username}!`,
          variant: "default"
        });
      } else {
        setLoginError(true);
        toast({
          title: "Acesso negado",
          description: "Você precisa comprar o acesso para usar a plataforma",
          variant: "destructive"
        });
      }
    } else {
      setLoginError(true);
      toast({
        title: "Erro de login",
        description: "Usuário ou senha incorretos",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginData({ username: '', password: '' });
    setActiveTab('embed');
  };

  const isConfigured = botToken.trim() !== '' && channelId.trim() !== '' && botChannelId.trim() !== '';

  const addField = () => {
    const newField: EmbedField = {
      id: Date.now().toString(),
      name: '',
      value: ''
    };
    setEmbedFields([...embedFields, newField]);
  };

  const removeField = (id: string) => {
    setEmbedFields(embedFields.filter(field => field.id !== id));
  };

  const updateField = (id: string, key: 'name' | 'value', value: string) => {
    setEmbedFields(embedFields.map(field => 
      field.id === id ? { ...field, [key]: value } : field
    ));
  };

  const generateEmbedData = (): DiscordEmbed => {
    const embed: DiscordEmbed = {};
    
    if (embedTitle) embed.title = embedTitle;
    if (embedDescription) embed.description = embedDescription;
    if (embedColor) embed.color = parseInt(embedColor.replace('#', ''), 16);
    if (embedImage) embed.image = { url: embedImage };
    if (embedThumbnail) embed.thumbnail = { url: embedThumbnail };
    if (embedAuthor) embed.author = { name: embedAuthor };
    if (embedFooter) embed.footer = { text: embedFooter };
    if (embedTimestamp) embed.timestamp = new Date().toISOString();
    
    const validFields = embedFields.filter(field => field.name && field.value);
    if (validFields.length > 0) {
      embed.fields = validFields.map(field => ({
        name: field.name,
        value: field.value,
        inline: false
      }));
    }
    
    return embed;
  };

  const sendEmbed = () => {
    if (!isConfigured) {
      toast({
        title: "Erro",
        description: "Configure o bot antes de enviar o embed",
        variant: "destructive"
      });
      return;
    }

    const embedData = generateEmbedData();
    
    // Log token usage (user-specific)
    const tokenLog: TokenLog = {
      token: botToken.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
      user: currentUser!.username,
      channelId: channelId
    };
    LocalStorage.addTokenLog(tokenLog, currentUser!.username);
    
    // Log message (user-specific)
    const messageLog: MessageLog = {
      embed: embedData,
      timestamp: new Date().toISOString(),
      user: currentUser!.username,
      channelId: channelId,
      status: 'sent'
    };
    LocalStorage.addMessageLog(messageLog, currentUser!.username);
    
    // Simulate Discord API call
    console.log('Sending embed to Discord:', embedData);
    console.log('Channel ID:', channelId);
    console.log('Bot Token:', botToken.substring(0, 10) + '...');
    
    // Update logs state (reload user-specific or all logs based on role)
    if (currentUser!.role === 'admin') {
      setTokenLogs(LocalStorage.getAllTokenLogs());
      setMessageLogs(LocalStorage.getAllMessageLogs());
    } else {
      setTokenLogs(LocalStorage.getTokenLogs(currentUser!.username));
      setMessageLogs(LocalStorage.getMessageLogs(currentUser!.username));
    }
    
    // Clear sensitive fields after sending
    setBotToken('');
    setChannelId('');
    setBotChannelId('');
    
    toast({
      title: "Sucesso",
      description: "Embed enviado com sucesso! Campos de segurança limpos.",
      variant: "default"
    });
    
    // TODO: Implement real Discord API call
    // const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bot ${botToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ embeds: [embedData] })
    // });
  };

  const clearTokenLogs = () => {
    if (currentUser!.role === 'admin') {
      if (confirm('Tem certeza que deseja limpar TODOS os logs de tokens de TODOS os usuários?')) {
        // Admin clears all users' token logs
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('tokenLogs')) {
            localStorage.removeItem(key);
          }
        }
        setTokenLogs([]);
      }
    } else {
      if (confirm('Tem certeza que deseja limpar seus logs de tokens?')) {
        LocalStorage.clearTokenLogs(currentUser!.username);
        setTokenLogs([]);
      }
    }
  };

  const clearMessageLogs = () => {
    if (currentUser!.role === 'admin') {
      if (confirm('Tem certeza que deseja limpar TODOS os logs de mensagens de TODOS os usuários?')) {
        // Admin clears all users' message logs
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('messageLogs')) {
            localStorage.removeItem(key);
          }
        }
        setMessageLogs([]);
      }
    } else {
      if (confirm('Tem certeza que deseja limpar seus logs de mensagens?')) {
        LocalStorage.clearMessageLogs(currentUser!.username);
        setMessageLogs([]);
      }
    }
  };

  const exportLogs = () => {
    LocalStorage.exportLogs();
  };

  const handleUserCreated = () => {
    setUsers(LocalStorage.getUsers());
  };

  const renderEmbedPreview = () => {
    const embed = generateEmbedData();
    
    if (!isConfigured) {
      return (
        <div className="text-gray-400 text-center py-8">
          Configure o bot para visualizar o preview
        </div>
      );
    }
    
    if (!embed.title && !embed.description && !embed.author && !embed.fields?.length) {
      return (
        <div className="text-gray-400 text-center py-8">
          Preencha os campos para ver o preview
        </div>
      );
    }

    return (
      <div 
        className="border-l-4 p-4 rounded-lg bg-discord-secondary"
        style={{ borderLeftColor: embedColor }}
      >
        {embed.author && (
          <div className="text-white font-medium mb-2">{embed.author.name}</div>
        )}
        
        {embed.title && (
          <div className="text-blue-400 font-bold text-lg mb-2">{embed.title}</div>
        )}
        
        {embed.description && (
          <div className="text-gray-300 mb-3">{embed.description}</div>
        )}
        
        {embed.fields && embed.fields.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mb-3">
            {embed.fields.map((field, index) => (
              <div key={index}>
                <div className="text-white font-medium text-sm">{field.name}</div>
                <div className="text-gray-300 text-sm">{field.value}</div>
              </div>
            ))}
          </div>
        )}
        
        {embed.image && (
          <img 
            src={embed.image.url} 
            alt="Embed image" 
            className="rounded mt-3 max-w-full h-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        
        <div className="flex items-center justify-between">
          <div>
            {embed.footer && (
              <div className="text-xs text-gray-400 mt-3">{embed.footer.text}</div>
            )}
          </div>
          <div className="flex items-center">
            {embed.timestamp && (
              <div className="text-xs text-gray-400 mt-3">
                {new Date(embed.timestamp).toLocaleString()}
              </div>
            )}
            {embed.thumbnail && (
              <img 
                src={embed.thumbnail.url} 
                alt="Thumbnail" 
                className="w-20 h-20 rounded ml-4 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-discord-darker">
        {/* Navigation Header */}
        <nav className="bg-discord-dark shadow-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="text-discord-primary text-2xl mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">Discord Embed Manager</h1>
              </div>
              <div className="flex items-center">
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Voltar ao Início
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Login Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto">
            <Card className="bg-discord-dark border-gray-700 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="text-discord-primary text-6xl mb-4">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Login</h2>
                  <p className="text-gray-400">Acesse o painel de gerenciamento</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label className="text-gray-300">Usuário</Label>
                    <Input
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                      placeholder="Digite seu usuário"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Senha</Label>
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                      placeholder="Digite sua senha"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-discord-primary hover:bg-blue-600 text-white font-semibold"
                  >
                    Entrar
                  </Button>
                  
                  {loginError && (
                    <div className="bg-discord-red/20 border border-discord-red text-discord-red px-4 py-3 rounded-lg text-sm">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Acesso negado
                      </div>
                      <p className="text-xs">
                        Credenciais inválidas ou você não possui acesso válido. 
                        Se ainda não comprou, <a href="/" className="underline hover:text-red-300">clique aqui para adquirir</a>.
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-discord-darker">
      {/* Navigation Header */}
      <nav className="bg-discord-dark shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-discord-primary text-2xl mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Discord Embed Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Bem-vindo, {currentUser.username}!</span>
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="bg-discord-red hover:bg-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-discord-dark border-gray-700 mb-8">
            <TabsTrigger value="embed" className="tab-btn">
              <Edit className="w-4 h-4 mr-2" />
              Criar Embed
            </TabsTrigger>
            {currentUser.role === 'admin' && (
              <TabsTrigger value="admin" className="tab-btn">
                <Shield className="w-4 h-4 mr-2" />
                Painel Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="embed">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuration Panel */}
              <div className="space-y-6">
                <Card className="bg-discord-dark border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-discord-primary" />
                      Configuração do Bot
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Token do Bot</Label>
                        <Input
                          type="password"
                          value={botToken}
                          onChange={(e) => setBotToken(e.target.value)}
                          className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                          placeholder="Cole o token do seu bot aqui"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300">ID do Canal</Label>
                        <Input
                          type="text"
                          value={channelId}
                          onChange={(e) => setChannelId(e.target.value)}
                          className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                          placeholder="ID do canal onde enviar"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300">ID do Canal do Bot</Label>
                        <Input
                          type="text"
                          value={botChannelId}
                          onChange={(e) => setBotChannelId(e.target.value)}
                          className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                          placeholder="ID do canal do bot"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isConfigured && (
                  <Card className="bg-discord-dark border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-discord-primary" />
                        Personalizar Embed
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Título</Label>
                          <Input
                            type="text"
                            value={embedTitle}
                            onChange={(e) => setEmbedTitle(e.target.value)}
                            className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                            placeholder="Título do embed"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-300">Descrição</Label>
                          <Textarea
                            value={embedDescription}
                            onChange={(e) => setEmbedDescription(e.target.value)}
                            className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent resize-none mt-2"
                            placeholder="Descrição do embed"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-300">Cor</Label>
                          <div className="flex space-x-2 mt-2">
                            <input
                              type="color"
                              value={embedColor}
                              onChange={(e) => setEmbedColor(e.target.value)}
                              className="w-12 h-10 bg-discord-secondary border border-gray-600 rounded-lg cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={embedColor}
                              onChange={(e) => setEmbedColor(e.target.value)}
                              className="flex-1 bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">URL da Imagem</Label>
                            <Input
                              type="url"
                              value={embedImage}
                              onChange={(e) => setEmbedImage(e.target.value)}
                              className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                              placeholder="https://..."
                            />
                          </div>
                          
                          <div>
                            <Label className="text-gray-300">URL da Thumbnail</Label>
                            <Input
                              type="url"
                              value={embedThumbnail}
                              onChange={(e) => setEmbedThumbnail(e.target.value)}
                              className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-gray-300">Autor</Label>
                          <Input
                            type="text"
                            value={embedAuthor}
                            onChange={(e) => setEmbedAuthor(e.target.value)}
                            className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                            placeholder="Nome do autor"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-300">Footer</Label>
                          <Input
                            type="text"
                            value={embedFooter}
                            onChange={(e) => setEmbedFooter(e.target.value)}
                            className="bg-discord-secondary border-gray-600 text-white focus:ring-discord-primary focus:border-transparent mt-2"
                            placeholder="Texto do footer"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="timestamp"
                            checked={embedTimestamp}
                            onCheckedChange={(checked) => setEmbedTimestamp(checked as boolean)}
                          />
                          <Label htmlFor="timestamp" className="text-gray-300">
                            Incluir timestamp atual
                          </Label>
                        </div>
                        
                        {/* Fields Section */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Label className="text-gray-300">Campos Adicionais</Label>
                            <Button
                              onClick={addField}
                              size="sm"
                              className="bg-discord-green hover:bg-green-600 text-white"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Adicionar Campo
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {embedFields.map((field) => (
                              <div key={field.id} className="bg-discord-secondary rounded-lg p-3 border border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-300">Campo</span>
                                  <Button
                                    onClick={() => removeField(field.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-discord-red hover:text-red-400 h-auto p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <Input
                                    value={field.name}
                                    onChange={(e) => updateField(field.id, 'name', e.target.value)}
                                    className="bg-discord-dark border-gray-600 text-white text-sm focus:ring-discord-primary"
                                    placeholder="Título do campo"
                                  />
                                  <Textarea
                                    value={field.value}
                                    onChange={(e) => updateField(field.id, 'value', e.target.value)}
                                    className="bg-discord-dark border-gray-600 text-white text-sm focus:ring-discord-primary resize-none"
                                    rows={2}
                                    placeholder="Valor do campo"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Button
                          onClick={sendEmbed}
                          className="w-full bg-discord-primary hover:bg-blue-600 text-white font-semibold"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Embed
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Preview Panel */}
              <div className="space-y-6">
                <Card className="bg-discord-dark border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-discord-primary" />
                      Preview do Embed
                    </h3>
                    
                    {renderEmbedPreview()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {currentUser.role === 'admin' && (
            <TabsContent value="admin">
              <Tabs defaultValue="logs" className="w-full">
                <TabsList className="bg-discord-dark border-gray-700 mb-6">
                  <TabsTrigger value="logs" className="tab-btn">
                    <Key className="w-4 h-4 mr-2" />
                    Logs
                  </TabsTrigger>
                  <TabsTrigger value="purchases" className="tab-btn">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Compras
                  </TabsTrigger>
                  <TabsTrigger value="users" className="tab-btn">
                    <Shield className="w-4 h-4 mr-2" />
                    Usuários
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="logs">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Token Logs */}
                    <Card className="bg-discord-dark border-gray-700">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                          <Key className="w-5 h-5 mr-2 text-discord-primary" />
                          Logs de Tokens
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {tokenLogs.length === 0 ? (
                            <div className="text-gray-400 text-center py-4">Nenhum token utilizado ainda</div>
                          ) : (
                            tokenLogs.map((log, index) => (
                              <div key={index} className="bg-discord-secondary rounded-lg p-3 border border-gray-600">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-white font-medium">{log.token}</div>
                                    <div className="text-gray-400 text-sm">Canal: {log.channelId}</div>
                                    <div className="text-gray-400 text-sm">Usuário: {log.user}</div>
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Message Logs */}
                    <Card className="bg-discord-dark border-gray-700">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-discord-primary" />
                          Logs de Mensagens
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {messageLogs.length === 0 ? (
                            <div className="text-gray-400 text-center py-4">Nenhuma mensagem enviada ainda</div>
                          ) : (
                            messageLogs.map((log, index) => (
                              <div key={index} className="bg-discord-secondary rounded-lg p-3 border border-gray-600">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-white font-medium">{log.embed.title || 'Sem título'}</div>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-gray-400 text-sm mb-1">
                                  {log.embed.description ? 
                                    log.embed.description.substring(0, 100) + (log.embed.description.length > 100 ? '...' : '') : 
                                    'Sem descrição'
                                  }
                                </div>
                                <div className="text-gray-400 text-xs">
                                  Canal: {log.channelId} | Usuário: {log.user}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Admin Controls */}
                  <Card className="mt-8 bg-discord-dark border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Wrench className="w-5 h-5 mr-2 text-discord-primary" />
                        Controles Administrativos
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        <Button
                          onClick={clearTokenLogs}
                          variant="destructive"
                          className="bg-discord-red hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar Logs de Tokens
                        </Button>
                        <Button
                          onClick={clearMessageLogs}
                          variant="destructive"
                          className="bg-discord-red hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar Logs de Mensagens
                        </Button>
                        <Button
                          onClick={exportLogs}
                          className="bg-discord-green hover:bg-green-600 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar Logs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="purchases">
                  <Card className="bg-discord-dark border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-discord-primary" />
                        Logs de Compras ({purchaseLogs.length})
                      </h3>
                      <div className="space-y-3">
                        {purchaseLogs.length === 0 ? (
                          <div className="text-gray-400 text-center py-8">Nenhuma compra registrada ainda</div>
                        ) : (
                          purchaseLogs.map((log, index) => (
                            <div key={index} className="bg-discord-secondary rounded-lg p-4 border border-gray-600">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-white font-medium">{log.buyerName}</div>
                                  <div className="text-sm text-gray-400">ID: {log.paymentId}</div>
                                  <div className="text-sm text-gray-400">Status: {log.status}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-discord-green font-medium">R$ {log.amount.toFixed(2)}</div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users">
                  <UserManagement onUserCreated={handleUserCreated} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          )}
        </Tabs>
      </div>


    </div>
  );
}
