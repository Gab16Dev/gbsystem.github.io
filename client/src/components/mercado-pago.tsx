import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LocalStorage } from '@/lib/storage';
import { PurchaseLog, User } from '@/lib/discord-types';
import { CreditCard, User as UserIcon, Check, AlertTriangle } from 'lucide-react';

interface MercadoPagoProps {
  onPurchaseSuccess: (newUser: { username: string; password: string }) => void;
}

export default function MercadoPago({ onPurchaseSuccess }: MercadoPagoProps) {
  const [buyerName, setBuyerName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'checking' | 'completed'>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const { toast } = useToast();

  const PRICE = 29.90; // Preço fixo do acesso

  const generatePaymentLink = async () => {
    if (!buyerName.trim()) {
      toast({
        title: "Erro",
        description: "Digite seu nome antes de continuar",
        variant: "destructive"
      });
      return;
    }

    setPaymentStatus('processing');

    try {
      // Simulação da criação de preferência no Mercado Pago
      // Em produção, isso seria feito no backend
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

      // Simular chamada para API do Mercado Pago
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
      // Simular verificação de status
      // Em produção, isso consultaria a API do Mercado Pago
      console.log('Verificando status do pagamento:', paymentId);
      
      // Simular aprovação (para demonstração)
      const isApproved = Math.random() > 0.3; // 70% de chance de aprovação para teste
      
      if (isApproved) {
        // Gerar senha automática
        const generatedPassword = Math.random().toString(36).slice(-8);
        const username = buyerName.toLowerCase().replace(/\s+/g, '');
        
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
        
        toast({
          title: "Pagamento aprovado!",
          description: `Usuário criado: ${username}`,
          variant: "default"
        });
        
        onPurchaseSuccess({ username, password: generatedPassword });
        
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

  if (paymentStatus === 'completed') {
    return (
      <Card className="bg-discord-dark border-gray-700">
        <CardHeader>
          <CardTitle className="text-discord-green flex items-center">
            <Check className="mr-2" />
            Pagamento Aprovado!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-green-400 text-sm mb-4">
              Seu acesso foi liberado com sucesso!
            </div>
            <Button 
              onClick={() => {
                setBuyerName('');
                setPaymentStatus('idle');
                setPaymentId(null);
                setPaymentLink(null);
              }}
              className="bg-discord-primary hover:bg-blue-600"
            >
              Nova Compra
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-discord-dark border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <CreditCard className="mr-2" />
          Comprar Acesso - R$ {PRICE.toFixed(2)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">Nome do Comprador</Label>
          <Input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="bg-discord-secondary border-gray-600 text-white mt-2"
            placeholder="Digite seu nome completo"
            disabled={paymentStatus !== 'idle'}
          />
        </div>

        {paymentStatus === 'idle' && (
          <Button 
            onClick={generatePaymentLink}
            className="w-full bg-discord-green hover:bg-green-600"
            disabled={!buyerName.trim()}
          >
            Gerar Link de Pagamento
          </Button>
        )}

        {paymentStatus === 'processing' && (
          <div className="text-center text-gray-400">
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
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <strong>O que você recebe:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Acesso completo ao sistema</li>
            <li>Criação ilimitada de embeds</li>
            <li>Integração com Discord</li>
            <li>Suporte técnico</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}