import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LocalStorage } from '@/lib/storage';
import { PurchaseLog, User } from '@/lib/discord-types';
import { 
  CreditCard, 
  Shield, 
  Zap, 
  CheckCircle, 
  Star,
  ArrowRight,
  LogIn,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'wouter';

interface HomeProps {
  onLoginRedirect: () => void;
}

export default function Home({ onLoginRedirect }: HomeProps) {
  const [showPurchase, setShowPurchase] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [desiredUsername, setDesiredUsername] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'checking' | 'completed'>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [newUserCredentials, setNewUserCredentials] = useState<{ username: string; password: string } | null>(null);
  const { toast } = useToast();

  const PRICE = 29.90;

  const generatePaymentLink = async () => {
    if (!buyerName.trim() || !desiredUsername.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos antes de continuar",
        variant: "destructive"
      });
      return;
    }

    // Verificar se username já existe
    const existingUsers = LocalStorage.getUsers();
    const username = desiredUsername.toLowerCase().replace(/\s+/g, '');
    
    if (existingUsers[username]) {
      toast({
        title: "Erro",
        description: "Nome de usuário já existe. Escolha outro.",
        variant: "destructive"
      });
      return;
    }

    setPaymentStatus('processing');

    try {
      // Simulação da criação de preferência no Mercado Pago
      const preference = {
        items: [
          {
            title: "Acesso Discord Embed Manager",
            description: "Acesso completo ao sistema de gerenciamento de embeds",
            quantity: 1,
            currency_id: "BRL",
            unit_price: PRICE
          }
        ],
        payer: {
          name: buyerName
        },
        back_urls: {
          success: window.location.href,
          failure: window.location.href,
          pending: window.location.href
        },
        auto_return: "approved"
      };

      console.log('Criando preferência de pagamento:', preference);
      
      // Simular resposta da API
      const mockResponse = {
        id: `MP-${Date.now()}`,
        init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=MP-${Date.now()}`,
        sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=MP-${Date.now()}`
      };

      setPaymentId(mockResponse.id);
      setPaymentLink(mockResponse.sandbox_init_point);
      setPaymentStatus('checking');

      toast({
        title: "Link gerado",
        description: "Clique no botão para ser redirecionado ao pagamento",
        variant: "default"
      });

    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar link de pagamento",
        variant: "destructive"
      });
      setPaymentStatus('idle');
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentId) return;

    try {
      console.log('Verificando status do pagamento:', paymentId);
      
      // Simular aprovação (70% de chance para teste)
      const isApproved = Math.random() > 0.3;
      
      if (isApproved) {
        // Gerar senha automática
        const generatedPassword = Math.random().toString(36).slice(-8);
        const username = desiredUsername.toLowerCase().replace(/\s+/g, '');
        
        // Criar novo usuário
        const newUser: User = {
          username: username,
          password: generatedPassword,
          role: 'user'
        };
        
        // Salvar usuário
        LocalStorage.addUser(username, newUser);
        
        // Registrar compra
        const purchaseLog: PurchaseLog = {
          id: paymentId,
          buyerName: buyerName,
          amount: PRICE,
          timestamp: new Date().toISOString(),
          status: 'approved',
          paymentId: paymentId
        };
        
        LocalStorage.addPurchaseLog(purchaseLog);
        
        setPaymentStatus('completed');
        setNewUserCredentials({ username, password: generatedPassword });
        
        toast({
          title: "Pagamento aprovado!",
          description: `Usuário ${username} criado com sucesso`,
          variant: "default"
        });
        
      } else {
        toast({
          title: "Pagamento pendente",
          description: "Aguarde a confirmação do pagamento",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao verificar status do pagamento",
        variant: "destructive"
      });
    }
  };

  const resetPurchase = () => {
    setShowPurchase(false);
    setBuyerName('');
    setDesiredUsername('');
    setPaymentStatus('idle');
    setPaymentId(null);
    setPaymentLink(null);
    setNewUserCredentials(null);
  };

  if (paymentStatus === 'completed' && newUserCredentials) {
    return (
      <div className="min-h-screen bg-discord-darker">
        {/* Header */}
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
              <Button 
                onClick={onLoginRedirect}
                variant="outline"
                className="border-discord-primary text-discord-primary hover:bg-discord-primary hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </nav>

        {/* Success Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="bg-discord-dark border-gray-700">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-discord-green text-6xl mb-6">
                  <CheckCircle className="w-20 h-20 mx-auto" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Pagamento Aprovado!</h2>
                <p className="text-gray-400 mb-8">
                  Seu acesso foi criado com sucesso. Anote suas credenciais de login:
                </p>
                
                <div className="bg-discord-secondary rounded-lg p-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Usuário:</label>
                      <div className="text-white font-mono bg-gray-800 px-4 py-3 rounded text-lg">
                        {newUserCredentials.username}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Senha:</label>
                      <div className="text-white font-mono bg-gray-800 px-4 py-3 rounded text-lg">
                        {newUserCredentials.password}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-discord-yellow/20 border border-discord-yellow text-discord-yellow px-4 py-3 rounded-lg text-sm mb-8">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Salve essas credenciais! Elas não serão mostradas novamente.
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={onLoginRedirect}
                    className="flex-1 bg-discord-primary hover:bg-blue-600"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Fazer Login Agora
                  </Button>
                  <Button 
                    onClick={resetPurchase}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Nova Compra
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-discord-darker">
      {/* Header */}
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
            <Button 
              onClick={onLoginRedirect}
              variant="outline"
              className="border-discord-primary text-discord-primary hover:bg-discord-primary hover:text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Gerencie seus Embeds do Discord
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Crie, personalize e envie embeds profissionais para seu servidor Discord 
            com nossa plataforma completa e intuitiva.
          </p>
          
          {!showPurchase ? (
            <Button 
              onClick={() => setShowPurchase(true)}
              size="lg"
              className="bg-discord-primary hover:bg-blue-600 text-white px-8 py-4 text-lg"
            >
              <CreditCard className="w-5 h-5 mr-3" />
              Comprar Acesso - R$ {PRICE.toFixed(2)}
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          ) : null}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-discord-dark border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-discord-primary text-4xl mb-4">
                <Zap className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Rápido & Fácil</h3>
              <p className="text-gray-400">
                Interface intuitiva para criar embeds profissionais em segundos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-discord-dark border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-discord-green text-4xl mb-4">
                <Shield className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Seguro</h3>
              <p className="text-gray-400">
                Seus dados e tokens são protegidos com máxima segurança
              </p>
            </CardContent>
          </Card>

          <Card className="bg-discord-dark border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-discord-yellow text-4xl mb-4">
                <Star className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Completo</h3>
              <p className="text-gray-400">
                Todas as funcionalidades do Discord em uma única plataforma
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Form */}
        {showPurchase && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-discord-dark border-gray-700">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Finalizar Compra</h2>
                  <p className="text-gray-400">Preencha os dados para gerar seu acesso</p>
                </div>

                {paymentStatus === 'idle' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Nome Completo</Label>
                      <Input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="bg-discord-secondary border-gray-600 text-white mt-2"
                        placeholder="Digite seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Nome de Usuário Desejado</Label>
                      <Input
                        type="text"
                        value={desiredUsername}
                        onChange={(e) => setDesiredUsername(e.target.value)}
                        className="bg-discord-secondary border-gray-600 text-white mt-2"
                        placeholder="Digite o username que deseja usar"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Este será seu nome de usuário para fazer login
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        onClick={generatePaymentLink}
                        className="flex-1 bg-discord-green hover:bg-green-600"
                        disabled={!buyerName.trim() || !desiredUsername.trim()}
                      >
                        Gerar Link de Pagamento
                      </Button>
                      <Button 
                        onClick={() => setShowPurchase(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {paymentStatus === 'processing' && (
                  <div className="text-center text-gray-400 py-8">
                    Gerando link de pagamento...
                  </div>
                )}

                {paymentStatus === 'checking' && paymentLink && (
                  <div className="space-y-4">
                    <Button 
                      onClick={() => window.open(paymentLink, '_blank')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Pagar no Mercado Pago
                    </Button>
                    
                    <div className="text-center text-sm text-gray-400">
                      Após realizar o pagamento, clique no botão abaixo para verificar o status
                    </div>
                    
                    <Button 
                      onClick={checkPaymentStatus}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <AlertTriangle className="mr-2 w-4 h-4" />
                      Verificar Pagamento
                    </Button>

                    <Button 
                      onClick={resetPurchase}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}