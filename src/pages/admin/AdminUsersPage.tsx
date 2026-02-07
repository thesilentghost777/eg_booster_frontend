import React, { useState, useEffect } from 'react';
import { Search, Filter, UserX, UserCheck, Coins, Eye, MoreVertical, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface AdminUser {
  id: number;
  prenom: string;
  telephone: string;
  email?: string;
  points_balance: number;
  referral_code: string;
  free_views_claimed: boolean;
  inscrit_le: string;
  is_blocked: boolean;
  orders_count: number;
  referrals_count: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBlocked, setFilterBlocked] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.adminGetUsers() as { data: AdminUser[] };
      setUsers(data.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesBlocked = filterBlocked === 'all' || 
      (filterBlocked === 'blocked' && user.is_blocked) ||
      (filterBlocked === 'active' && !user.is_blocked);
    const matchesSearch = !searchQuery || 
      user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.telephone.includes(searchQuery);
    return matchesBlocked && matchesSearch;
  });

  const handleToggleBlock = async (user: AdminUser) => {
    setIsProcessing(true);
    try {
      await api.adminToggleBlockUser(user.id);
      await loadUsers();
      toast.success(user.is_blocked ? 'Utilisateur débloqué' : 'Utilisateur bloqué');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCredit = async () => {
    if (!selectedUser || !creditAmount) return;

    setIsProcessing(true);
    try {
      const amount = parseInt(creditAmount);
      await api.adminCreditUser(selectedUser.id, amount, creditDescription);
      await loadUsers();
      toast.success(`${amount} points crédités à ${selectedUser.prenom}`);
      setCreditDialogOpen(false);
      setCreditAmount('');
      setCreditDescription('');
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Utilisateurs</h1>
        <p className="text-muted-foreground">Gérez tous les utilisateurs de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background text-foreground border-border"
          />
        </div>
        <Select value={filterBlocked} onValueChange={setFilterBlocked}>
          <SelectTrigger className="w-full sm:w-48 h-11 bg-background text-foreground border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent className="bg-popover text-foreground">
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="blocked">Bloqués</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm bg-muted/50">
                <th className="text-left p-4 font-semibold text-foreground">Utilisateur</th>
                <th className="text-left p-4 font-semibold text-foreground">Téléphone</th>
                <th className="text-left p-4 font-semibold text-foreground">Solde</th>
                <th className="text-left p-4 font-semibold text-foreground">Commandes</th>
                <th className="text-left p-4 font-semibold text-foreground">Filleuls</th>
                <th className="text-left p-4 font-semibold text-foreground">Statut</th>
                <th className="text-left p-4 font-semibold text-foreground">Inscrit le</th>
                <th className="text-left p-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={cn(
                  "hover:bg-muted/30 transition-colors",
                  user.is_blocked && "opacity-60"
                )}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{user.prenom[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.prenom}</p>
                        {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-foreground">{user.telephone}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-foreground">{user.points_balance.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground ml-1">pts</span>
                  </td>
                  <td className="p-4">
                    <span className="text-foreground">{user.orders_count}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-foreground">{user.referrals_count}</span>
                  </td>
                  <td className="p-4">
                    {user.is_blocked ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-300">
                        Bloqué
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-300">
                        Actif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {user.inscrit_le}
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover text-foreground border-border">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUser(user);
                            setCreditDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Créditer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleBlock(user)}
                          className={cn("cursor-pointer", user.is_blocked ? 'text-green-600' : 'text-red-600')}
                        >
                          {user.is_blocked ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Débloquer
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Bloquer
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      {/* Credit dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Créditer l'utilisateur</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="font-medium text-foreground">{selectedUser.prenom}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.telephone}</p>
                <p className="text-sm mt-2 text-foreground">Solde actuel: <span className="font-bold">{selectedUser.points_balance} pts</span></p>
              </div>

              <div>
                <Label className="text-foreground font-medium">Montant (points)</Label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="Ex: 500"
                  className="mt-2 h-11 bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label className="text-foreground font-medium">Description</Label>
                <Input
                  value={creditDescription}
                  onChange={(e) => setCreditDescription(e.target.value)}
                  placeholder="Ex: Bonus fidélité"
                  className="mt-2 h-11 bg-background text-foreground border-border"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground"
                  onClick={() => setCreditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCredit}
                  disabled={isProcessing || !creditAmount}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Créditer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}