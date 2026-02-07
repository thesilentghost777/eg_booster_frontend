import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, User, Coins, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Transfer } from '@/types/api';

export default function TransferPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([]);

  useEffect(() => {
    loadTransferHistory();
  }, []);

  const loadTransferHistory = async () => {
    try {
      const response = await api.getTransferHistory();
      setRecentTransfers((response as { data?: Transfer[] }).data || []);
    } catch (error) {
      // Silent fail
    }
  };

  const numericAmount = parseInt(amount) || 0;
  const hasEnoughPoints = (user?.points_balance || 0) >= numericAmount;
  const isValidAmount = numericAmount >= 100;

  const handleSearchRecipient = async () => {
    if (recipientPhone.length < 9) {
      toast.error('Numéro invalide');
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.findRecipient(recipientPhone);
      const data = (response as { data: { recipient_name: string; id: number; telephone: string } }).data;
      
      // CORRECTION: Stocker les bonnes données
      setRecipientName(data.recipient_name);
      setRecipientId(data.id);
      
      toast.success('Destinataire trouvé !');
    } catch (error: any) {
      toast.error(error.message || 'Destinataire introuvable');
      setRecipientName(null);
      setRecipientId(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientPhone || !amount) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!isValidAmount) {
      toast.error('Montant minimum: 100 points');
      return;
    }

    if (!hasEnoughPoints) {
      toast.error('Solde insuffisant');
      return;
    }

    if (!recipientName) {
      toast.error('Veuillez vérifier le destinataire');
      return;
    }

    setIsLoading(true);
    try {
      await api.sendTransfer(recipientPhone, numericAmount);
      toast.success(`${numericAmount} points envoyés à ${recipientName} !`);
      await refreshUser();
      await loadTransferHistory();
      navigate('/wallet');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du transfert');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Transférer des points</h1>
          </div>

          {/* Balance card */}
          <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Votre solde</p>
                <p className="text-2xl font-bold text-foreground">{user?.points_balance?.toLocaleString() || 0} <span className="text-sm text-muted-foreground">pts</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pb-24 -mt-2">
        {/* Transfer form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Nouveau transfert
          </h3>

          {/* Recipient */}
<div className="space-y-3">
  <Label htmlFor="recipient" className="text-sm font-semibold text-foreground">
    Numéro du destinataire <span className="text-primary">*</span>
  </Label>
  <div className="flex gap-2">
    <Input
      id="recipient"
      type="tel"
      placeholder="699000001"
      value={recipientPhone}
      onChange={(e) => {
        setRecipientPhone(e.target.value);
        setRecipientName(null);
        setRecipientId(null);
      }}
      className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
    />
    <Button 
      type="button"
      variant="outline"
      className="h-12 px-4 border-border hover:bg-accent"
      onClick={handleSearchRecipient}
      disabled={isSearching || recipientPhone.length < 9}
    >
      {isSearching ? (
        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      ) : (
        <Search className="w-5 h-5 text-foreground" />
      )}
    </Button>
  </div>
  {recipientName && (
    <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-xl">
      <CheckCircle className="w-5 h-5 text-success" />
      <div>
        <p className="text-sm font-medium text-success">Destinataire trouvé</p>
        <p className="text-sm text-foreground">{recipientName}</p>
      </div>
    </div>
  )}
</div>

          {/* Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-semibold text-foreground">
              Montant à transférer <span className="text-primary">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 bg-muted/80 border border-border/50 rounded-xl text-foreground text-xl font-bold text-center placeholder:text-muted-foreground/60"
            />
            <p className="text-xs text-muted-foreground text-center">Minimum: 100 points</p>

            {/* Quick amounts */}
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={cn(
                    "px-4 py-2 rounded-xl font-medium transition-all flex-1",
                    amount === amt.toString()
                      ? "gradient-primary text-white"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Balance warning */}
          {amount && !hasEnoughPoints && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">
                Solde insuffisant. Il vous manque {numericAmount - (user?.points_balance || 0)} points.
              </p>
            </div>
          )}

          {/* Summary */}
          {recipientName && amount && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Destinataire</span>
                <span className="text-foreground">{recipientName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Montant</span>
                <span className="text-foreground">{numericAmount.toLocaleString()} points</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nouveau solde</span>
                <span className={cn("font-medium", hasEnoughPoints ? "text-foreground" : "text-destructive")}>
                  {((user?.points_balance || 0) - numericAmount).toLocaleString()} points
                </span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !hasEnoughPoints || !isValidAmount || !recipientName}
            className="w-full h-14 gradient-primary text-white font-bold text-lg rounded-xl shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5 mr-2" />
                Transférer {numericAmount > 0 ? `${numericAmount} points` : ''}
              </>
            )}
          </Button>
        </form>

        {/* Recent transfers */}
        {recentTransfers.length > 0 && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden mt-6">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Transferts récents</h3>
            </div>
            <div className="divide-y divide-border">
              {recentTransfers.slice(0, 5).map((transfer) => (
                <button
                  key={transfer.reference}
                  type="button"
                  onClick={() => {
                    if (transfer.direction === 'envoyé') {
                      setRecipientPhone(transfer.contact);
                      // Réinitialiser le nom pour forcer une nouvelle recherche
                      setRecipientName(null);
                      setRecipientId(null);
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{transfer.contact}</p>
                      <p className="text-xs text-muted-foreground">{transfer.direction}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-medium",
                      transfer.direction === 'envoyé' ? "text-destructive" : "text-success"
                    )}>
                      {transfer.direction === 'envoyé' ? '-' : '+'}{transfer.points} pts
                    </p>
                    <p className="text-xs text-muted-foreground">{transfer.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}