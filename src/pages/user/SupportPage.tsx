// SupportPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, Phone, Mail, Clock, ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const faqItems = [
  {
    question: 'Combien de temps pour recevoir mes vues ?',
    answer: 'Les vues sont généralement livrées en 24-48h selon la quantité commandée.',
  },
  {
    question: 'Comment recharger mon compte ?',
    answer: 'Allez dans Portefeuille > Recharger et choisissez votre moyen de paiement préféré.',
  },
  {
    question: 'Mes vues sont-elles garanties ?',
    answer: 'Oui, nous offrons une garantie de remplacement si les vues diminuent dans les 30 jours.',
  },
  {
    question: 'Comment fonctionne le parrainage ?',
    answer: 'Partagez votre code, et gagnez 500 points pour chaque ami qui s\'inscrit !',
  },
];

const contactMethods = [
  { icon: MessageCircle, label: 'WhatsApp', value: '', color: 'bg-green-500/20 text-green-500' },
  { icon: Mail, label: 'Email', value: 'support@egbooster.com', color: 'bg-secondary/20 text-secondary' },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    loadWhatsappNumber();
  }, []);

  const loadWhatsappNumber = async () => {
    try {
      const response = await api.getWhatsappNumber() as { data: { whatsapp_number?: string } };
      setWhatsappNumber(response.data.whatsapp_number || '');
      contactMethods[0].value = response.data.whatsapp_number || '';
      contactMethods[2].value = response.data.whatsapp_number || '';
    } catch (error) {
      // Silent fail
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      await api.createTicket(subject, message);
      toast.success('Message envoyé ! Nous vous répondrons bientôt.');
      setSubject('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Support</h1>
          </div>

         
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pb-24 -mt-2">
        {/* FAQ */}
        <div className="bg-card rounded-2xl border border-border mb-6 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Questions fréquentes
            </h3>
          </div>
          <div className="divide-y divide-border">
            {faqItems.map((item, index) => (
              <div key={index}>
                <button
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span className="font-medium text-foreground pr-4">{item.question}</span>
                  <ChevronRight className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                    expandedFaq === index && "rotate-90"
                  )} />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-muted-foreground text-sm">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Contact info */}
        <div className="mt-6 space-y-3">
          {contactMethods.map((method, index) => (
            method.value && (
              <div key={index} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", method.color)}>
                  <method.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.value}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}