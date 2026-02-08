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
    
    // Préfixer avec 237 si l'utilisateur a un numéro
    if (user?.telephone && !phoneNumber) {
      // Nettoyer le numéro et ajouter 237 si nécessaire
      const cleanNumber = user.telephone.replace(/\D/g, '');
      if (cleanNumber.length === 9) {
        setPhoneNumber('237' + cleanNumber);
      } else if (cleanNumber.startsWith('237')) {
        setPhoneNumber(cleanNumber);
      }
    }

    // Cleanup polling on unmount
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
    // Vérifier immédiatement
    checkPaymentStatus(externalId);
    
    // Puis vérifier toutes les 5 secondes pendant 2 minutes max
    let attempts = 0;
    const maxAttempts = 24; // 24 * 5s = 2 minutes
    
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
        // Sauvegarder la méthode de paiement utilisée
        setPendingPaymentMethod(paymentMethod);
        
        // Fermer le dialogue de dépôt
        setDialogOpen(false);
        setDepositAmount('');
        
        // Afficher le menu de paiement en attente
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
    // Nettoyer la valeur et limiter à 12 caractères (237 + 9 chiffres)
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
    <div className="min-h-screen bg-background dark">
      {/* Header avec safe area pour iPhone */}
      <div className="gradient-dark px-4 pt-safe pb-20">
        <div className="max-w-lg mx-auto">
          {/* Header sticky pour meilleure navigation */}
          <div className="flex items-center gap-3 mb-6 pt-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-muted-foreground hover:text-foreground transition-colors active:scale-95 p-2 -ml-2 rounded-xl hover:bg-white/5"
              aria-label="Retour"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Mon Portefeuille</h1>
          </div>

          {/* Balance card - Optimisé pour mobile */}
          <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-border/50 shadow-2xl">
            <div className="flex items-start sm:items-center gap-4 mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 gradient-secondary rounded-2xl flex items-center justify-center shadow-glow shrink-0">
                <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Solde disponible</p>
                <p className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight leading-none">
                  {user?.points_balance?.toLocaleString() || 0}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">≈ {user?.points_balance?.toLocaleString() || 0} FCFA</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary text-white rounded-xl h-11 sm:h-12 text-sm sm:text-base font-semibold active:scale-95 transition-transform">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Recharger
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border/50 w-[calc(100%-2rem)] sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg sm:text-xl font-display text-foreground">Recharger mon compte</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-2">
                    {/* Montants rapides */}
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Montant rapide</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {depositAmounts.map(amount => (
                          <button
                            key={amount}
                            onClick={() => setDepositAmount(amount.toString())}
                            className={cn(
                              "py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base active:scale-95",
                              depositAmount === amount.toString()
                                ? "gradient-primary text-white shadow-glow"
                                : "bg-muted text-foreground hover:bg-muted/80"
                            )}
                          >
                            {amount.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Montant personnalisé */}
                    <div>
                      <Label className="text-sm font-semibold text-foreground">Montant personnalisé (FCFA)</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Entrez le montant"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="h-12 mt-2 bg-muted/80 border border-border/50 text-foreground placeholder:text-muted-foreground/60 text-base"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Minimum: 500 FCFA
                      </p>
                    </div>

                    {/* Mode de paiement */}
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Mode de paiement</Label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <button
                          onClick={() => setPaymentMethod('momo')}
                          className={cn(
                            "p-3 sm:p-4 rounded-xl border-2 transition-all text-left active:scale-95",
                            paymentMethod === 'momo'
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-2 bg-white/5 p-1.5">
                            <img 
                              src="/momo.png" 
                              alt="MTN MoMo" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="font-medium text-sm sm:text-base text-foreground">MTN MoMo</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Mobile Money</p>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('om')}
                          className={cn(
                            "p-3 sm:p-4 rounded-xl border-2 transition-all text-left active:scale-95",
                            paymentMethod === 'om'
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-2 bg-white/5 p-1.5">
                            <img 
                              src="/om.png" 
                              alt="Orange Money" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="font-medium text-sm sm:text-base text-foreground">Orange Money</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Mobile Money</p>
                        </button>
                      </div>
                    </div>

                    {/* Numéro de téléphone */}
                    <div>
                      <Label className="text-sm font-semibold text-foreground">Numéro de téléphone</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <Input
                          type="tel"
                          inputMode="tel"
                          placeholder="237XXXXXXXXX"
                          value={phoneNumber}
                          onChange={handlePhoneInput}
                          className="h-12 pl-11 bg-muted/80 border border-border/50 text-foreground placeholder:text-muted-foreground/60 font-mono text-base"
                          maxLength={12}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Format: 237 suivi de 9 chiffres (ex: 237690123456)
                      </p>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
                      <p className="text-sm font-medium text-blue-400 mb-2">ℹ️ Comment ça marche ?</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Entrez le montant et votre numéro</li>
                        <li>Cliquez sur "Confirmer le dépôt"</li>
                        <li>Validez la notification sur votre téléphone</li>
                        <li>Votre compte sera crédité automatiquement</li>
                      </ol>
                    </div>

                    {/* Button de confirmation */}
                    <Button
                      onClick={handleDeposit}
                      className="w-full h-12 sm:h-14 gradient-primary text-white rounded-xl font-semibold text-sm sm:text-base active:scale-95 transition-transform"
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
          </div>
        </div>
      </div>

      {/* Payment Pending Dialog */}
      <Dialog open={showPaymentPending} onOpenChange={setShowPaymentPending}>
        <DialogContent className="bg-card border-border/50 w-[calc(100%-2rem)] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-display text-foreground text-center">
              Paiement en attente
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 sm:space-y-6 py-4">
            {/* Loading animation */}
            <div className="flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>

            {/* Instructions */}
            <div className="text-center space-y-2 sm:space-y-3 px-2">
              <p className="text-base sm:text-lg font-semibold text-foreground">
                Validez le paiement sur votre téléphone
              </p>
              <p className="text-sm text-muted-foreground">
                Une notification a été envoyée au <span className="font-mono font-medium text-foreground block sm:inline mt-1 sm:mt-0">{phoneNumber}</span>
              </p>
            </div>

            {/* USSD code */}
            <div className="bg-muted/50 border border-border rounded-xl p-3 sm:p-4 space-y-3">
              <p className="text-xs sm:text-sm font-medium text-foreground text-center">
                Si la fenêtre ne s'ouvre pas automatiquement :
              </p>
              <div className="flex items-center justify-center bg-card rounded-lg p-4 border border-border">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    {pendingPaymentMethod === 'om' ? 'Orange Money' : 'MTN MoMo'}
                  </p>
                  <code className="text-2xl sm:text-3xl font-bold text-primary font-mono">
                    {pendingPaymentMethod === 'om' ? '#150*50#' : '*126#'}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">Composez ce code</p>
                </div>
              </div>
            </div>

            {/* Status message */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                La vérification du paiement se fait automatiquement. Cette fenêtre se fermera dès confirmation.
              </p>
            </div>

            {/* Cancel button */}
            <Button
              variant="outline"
              className="w-full h-11 sm:h-12 active:scale-95 transition-transform"
              onClick={() => setShowPaymentPending(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transactions - Optimisé pour mobile */}
      <div className="px-4 -mt-8 max-w-lg mx-auto pb-safe pb-24">
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
          <div className="flex items-center gap-2 p-4 border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm sm:text-base">Historique des transactions</h2>
          </div>

          {isLoadingTx ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 active:bg-muted/30 transition-colors">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    tx.points >= 0 ? "bg-success/20" : "bg-muted"
                  )}>
                    {tx.points >= 0 ? (
                      <ArrowDownLeft className="w-5 h-5 text-success" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">{tx.type_label}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{tx.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "font-bold text-sm sm:text-base",
                      tx.points >= 0 ? "text-success" : "text-foreground"
                    )}>
                      {tx.points >= 0 ? '+' : ''}{tx.points.toLocaleString()}
                    </p>
                    {tx.amount_fcfa && (
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {tx.amount_fcfa.toLocaleString()} FCFA
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingTx && transactions.length === 0 && (
            <div className="p-8 sm:p-12 text-center">
              <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Aucune transaction</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Effectuez votre premier dépôt pour commencer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}