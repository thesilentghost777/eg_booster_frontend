import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Transaction } from '@/types/api';

const depositAmounts = [500, 1000, 2000, 5000, 10000];

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'om'>('momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showPaymentPending, setShowPaymentPending] = useState(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<'momo' | 'om'>('momo');

  useEffect(() => {
    loadTransactions();
    
    if (user?.telephone && !phoneNumber) {
      const cleanNumber = user.telephone.replace(/\D/g, '');
      if (cleanNumber.length === 9) {
        setPhoneNumber('237' + cleanNumber);
      } else if (cleanNumber.startsWith('237')) {
        setPhoneNumber(cleanNumber);
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const loadTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const response = await api.getTransactions();
      setTransactions((response as { data?: Transaction[] }).data || []);
    } catch (error) {
      // Silent fail
    } finally {
      setIsLoadingTx(false);
    }
  };

  const startPolling = (externalId: string) => {
    checkPaymentStatus(externalId);
    
    let attempts = 0;
    const maxAttempts = 24;
    
    const interval = setInterval(() => {
      attempts++;
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPollingInterval(null);
        setCurrentPaymentId(null);
        setShowPaymentPending(false);
        toast.info('Vérification du paiement en cours... Actualisez pour voir le statut.');
        return;
      }
      
      checkPaymentStatus(externalId);
    }, 5000);
    
    setPollingInterval(interval);
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);

    if (!amount || amount < 200) {
      toast.error('Montant minimum: 200 FCFA');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone.match(/^237[0-9]{9}$/)) {
      toast.error('Numéro invalide. Format requis: 237XXXXXXXXX');
      return;
    }

    setIsDepositing(true);
    try {
      const response = await api.deposit(amount, paymentMethod, cleanPhone);

      if ((response as { success?: boolean }).success) {
        setPendingPaymentMethod(paymentMethod);
        setDialogOpen(false);
        setDepositAmount('');
        setShowPaymentPending(true);
        
        const resp = response as { data?: { external_id?: string } };
        if (resp.data?.external_id) {
          setCurrentPaymentId(resp.data.external_id);
          startPolling(resp.data.external_id);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'initialisation du paiement');
    } finally {
      setIsDepositing(false);
    }
  };

  const checkPaymentStatus = async (externalId: string) => {
    try {
      const response = await api.checkPaymentStatus(externalId) as { data?: { status?: string } };
      
      if (response.data?.status === 'success') {
        toast.success('Paiement réussi! Votre compte a été crédité 🎉');
        await refreshUser();
        await loadTransactions();
        setCurrentPaymentId(null);
        setShowPaymentPending(false);
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      } else if (response.data?.status === 'failed') {
        toast.error('Paiement échoué. Veuillez réessayer.');
        setCurrentPaymentId(null);
        setShowPaymentPending(false);
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 12);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Aujourd'hui, " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return "Hier, " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="px-4 pt-6 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
              </button>
              <h1 className="text-[22px] font-semibold text-gray-900">Portefeuille</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        
        {/* Balance card */}
        <div className="pt-2 pb-6">
          <div className="text-[15px] text-gray-500 mb-3">Solde disponible</div>
          <div className="text-[56px] font-semibold text-gray-900 leading-none mb-1 tracking-tight">
            {user?.points_balance?.toLocaleString() || 0}
          </div>
          <div className="text-[15px] text-gray-500 mb-8">
            ≈ {user?.points_balance?.toLocaleString() || 0} FCFA
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-[52px] rounded-full text-[15px] font-medium">
                <Plus className="w-5 h-5 mr-2" />
                Recharger
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-100 w-[calc(100%-2rem)] sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-[20px] font-semibold text-gray-900">Recharger</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-5 mt-2">
                {/* Montants rapides */}
                <div>
                  <Label className="text-[14px] font-medium text-gray-900 mb-3 block">Montant</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {depositAmounts.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className={cn(
                          "py-3 rounded-2xl font-medium transition-all text-[15px] active:scale-95",
                          depositAmount === amount.toString()
                            ? "bg-blue-600 text-white"
                            : "bg-gray-50 text-gray-900 active:bg-gray-100"
                        )}
                      >
                        {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Montant personnalisé */}
                <div>
                  <Label className="text-[14px] font-medium text-gray-900">Montant personnalisé</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Entrez le montant"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="h-12 mt-2 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-400 text-[15px] rounded-2xl"
                  />
                  <p className="text-[13px] text-gray-500 mt-2">Minimum: 500 FCFA</p>
                </div>

                {/* Mode de paiement */}
                <div>
                  <Label className="text-[14px] font-medium text-gray-900 mb-3 block">Mode de paiement</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('momo')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left active:scale-95",
                        paymentMethod === 'momo'
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-100 active:bg-gray-50"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-white">
                        <img 
                          src="/momo.png" 
                          alt="MTN MoMo" 
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <p className="font-medium text-[14px] text-gray-900">MTN MoMo</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('om')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left active:scale-95",
                        paymentMethod === 'om'
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-100 active:bg-gray-50"
                      )}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 bg-white">
                        <img 
                          src="/om.png" 
                          alt="Orange Money" 
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <p className="font-medium text-[14px] text-gray-900">Orange Money</p>
                    </button>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <Label className="text-[14px] font-medium text-gray-900">Numéro</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="237XXXXXXXXX"
                      value={phoneNumber}
                      onChange={handlePhoneInput}
                      className="h-12 pl-11 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-400 font-mono text-[15px] rounded-2xl"
                      maxLength={12}
                    />
                  </div>
                  <p className="text-[13px] text-gray-500 mt-2">Format: 237XXXXXXXXX</p>
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-[14px] font-medium text-blue-600 mb-2">Comment ça marche ?</p>
                  <ol className="text-[13px] text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Entrez le montant et votre numéro</li>
                    <li>Cliquez sur "Confirmer"</li>
                    <li>Validez sur votre téléphone</li>
                    <li>Votre compte sera crédité</li>
                  </ol>
                </div>

                {/* Button */}
                <Button
                  onClick={handleDeposit}
                  className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-[15px] active:scale-95 transition-transform"
                  disabled={isDepositing || !depositAmount || !phoneNumber || parseInt(depositAmount) < 200}
                >
                  {isDepositing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Initialisation...</span>
                    </div>
                  ) : (
                    `Confirmer ${depositAmount ? parseInt(depositAmount).toLocaleString() : 0} FCFA`
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="font-medium text-[17px] text-gray-900">Historique</h2>
          </div>

          {isLoadingTx ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-4 active:bg-gray-50 -mx-2 px-2 rounded-2xl transition-colors">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    tx.points >= 0 ? "bg-green-50" : "bg-gray-50"
                  )}>
                    {tx.points >= 0 ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[15px] text-gray-900 truncate">{tx.type_label}</p>
                    <p className="text-[13px] text-gray-500 truncate">{tx.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "font-semibold text-[15px]",
                      tx.points >= 0 ? "text-green-600" : "text-gray-900"
                    )}>
                      {tx.points >= 0 ? '+' : ''}{tx.points.toLocaleString()}
                    </p>
                    {tx.amount_fcfa && (
                      <p className="text-[13px] text-gray-500 whitespace-nowrap">
                        {tx.amount_fcfa.toLocaleString()} F
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingTx && transactions.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-[15px] text-gray-400 mb-2">Aucune transaction</div>
              <div className="text-[13px] text-gray-400">Effectuez votre premier dépôt</div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Pending Dialog */}
      <Dialog open={showPaymentPending} onOpenChange={setShowPaymentPending}>
        <DialogContent className="bg-white border-gray-100 w-[calc(100%-2rem)] sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-semibold text-gray-900 text-center">
              Paiement en attente
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Loading */}
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>

            {/* Instructions */}
            <div className="text-center space-y-2 px-2">
              <p className="text-[17px] font-medium text-gray-900">
                Validez le paiement
              </p>
              <p className="text-[15px] text-gray-600">
                Notification envoyée au <span className="font-mono font-medium text-gray-900 block mt-1">{phoneNumber}</span>
              </p>
            </div>

            {/* USSD */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <p className="text-[13px] font-medium text-gray-600 text-center">
                Si la fenêtre ne s'ouvre pas :
              </p>
              <div className="flex items-center justify-center bg-white rounded-2xl p-5 border border-gray-100">
                <div className="text-center">
                  <p className="text-[13px] text-gray-500 mb-2">
                    {pendingPaymentMethod === 'om' ? 'Orange Money' : 'MTN MoMo'}
                  </p>
                  <code className="text-[32px] font-bold text-blue-600 font-mono">
                    {pendingPaymentMethod === 'om' ? '#150*50#' : '*126#'}
                  </code>
                  <p className="text-[13px] text-gray-500 mt-2">Composez ce code</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-blue-50 rounded-2xl p-3">
              <p className="text-[13px] text-center text-gray-600 leading-relaxed">
                La vérification est automatique. Cette fenêtre se fermera dès confirmation.
              </p>
            </div>

            {/* Close */}
            <Button
              className="w-full h-[48px] bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-full active:scale-95 transition-transform"
              onClick={() => setShowPaymentPending(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}