import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, Phone, Mail, Clock, ChevronRight, HelpCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const faqItems = [
  { question: 'Combien de temps pour recevoir mes vues ?', answer: 'Les vues sont généralement livrées en 24-48h selon la quantité commandée.' },
  { question: 'Comment recharger mon compte ?', answer: 'Allez dans Portefeuille > Recharger et choisissez votre moyen de paiement préféré.' },
  { question: 'Mes vues sont-elles garanties ?', answer: 'Oui, nous offrons une garantie de remplacement si les vues diminuent dans les 30 jours.' },
  { question: 'Comment fonctionne le parrainage ?', answer: "Partagez votre code, et gagnez 500 points pour chaque ami qui s'inscrit !" },
];

const contactMethods = [
  { icon: FaWhatsapp, label: 'WhatsApp', value: '+237 XXX XXX XXX', action: 'https://wa.me/237XXXXXXXXX' },
  { icon: Mail, label: 'Email', value: 'support@egbooster.com', action: 'mailto:support@egbooster.com' },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="safe-area-top" />
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border/50">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Support</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-safe space-y-6">
        {/* FAQ */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Questions fréquentes</h2>
          </div>
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <div key={index} className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left active:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground pr-3">{item.question}</span>
                  <ChevronRight className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform flex-shrink-0",
                    expandedFaq === index && "rotate-90"
                  )} />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Methods */}
        <div className="space-y-2">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.action}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 active:scale-[0.98] transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <method.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{method.label}</p>
                <p className="text-xs text-muted-foreground">{method.value}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Nous contacter</h2>
          </div>
        
        </div>
      </div>
    </div>
  );
}
