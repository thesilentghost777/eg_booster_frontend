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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Transférer des points</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Balance card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Votre solde</p>
              <p className="text-2xl font-semibold text-gray-900">{user?.points_balance?.toLocaleString() || 0} <span className="text-sm text-gray-500">pts</span></p>
            </div>
          </div>
        </div>

        {/* Transfer form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            Nouveau transfert
          </h3>

          {/* Recipient */}
          <div className="space-y-3">
            <Label htmlFor="recipient" className="text-sm font-medium text-gray-900">
              Numéro du destinataire <span className="text-red-600">*</span>
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
                className="h-11 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <Button 
                type="button"
                variant="outline"
                className="h-11 px-4 bg-gray-50 border-gray-200 hover:bg-gray-100 rounded-xl"
                onClick={handleSearchRecipient}
                disabled={isSearching || recipientPhone.length < 9}
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-gray-900" />
                )}
              </Button>
            </div>
            {recipientName && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Destinataire trouvé</p>
                  <p className="text-sm text-gray-900">{recipientName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-900">
              Montant à transférer <span className="text-red-600">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 bg-gray-50 border-gray-200 rounded-xl text-gray-900 text-xl font-semibold text-center placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 text-center">Minimum: 100 points</p>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={cn(
                    "px-4 py-2 rounded-xl font-medium transition-colors",
                    amount === amt.toString()
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  )}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Balance warning */}
          {amount && !hasEnoughPoints && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-900">
                Solde insuffisant. Il vous manque {numericAmount - (user?.points_balance || 0)} points.
              </p>
            </div>
          )}

          {/* Summary */}
          {recipientName && amount && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Destinataire</span>
                <span className="text-gray-900 font-medium">{recipientName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Montant</span>
                <span className="text-gray-900 font-medium">{numericAmount.toLocaleString()} points</span>
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Nouveau solde</span>
                <span className={cn("font-semibold", hasEnoughPoints ? "text-gray-900" : "text-red-600")}>
                  {((user?.points_balance || 0) - numericAmount).toLocaleString()} points
                </span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !hasEnoughPoints || !isValidAmount || !recipientName}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Transferts récents</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {recentTransfers.slice(0, 5).map((transfer) => (
                <button
                  key={transfer.reference}
                  type="button"
                  onClick={() => {
                    if (transfer.direction === 'envoyé') {
                      setRecipientPhone(transfer.contact);
                      setRecipientName(null);
                      setRecipientId(null);
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{transfer.contact}</p>
                      <p className="text-xs text-gray-500">{transfer.direction}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-medium",
                      transfer.direction === 'envoyé' ? "text-red-600" : "text-green-600"
                    )}>
                      {transfer.direction === 'envoyé' ? '-' : '+'}{transfer.points} pts
                    </p>
                    <p className="text-xs text-gray-500">{transfer.date}</p>
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