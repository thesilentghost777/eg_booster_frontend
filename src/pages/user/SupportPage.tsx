import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, Mail, ChevronDown } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const faqItems = [
  { question: 'Combien de temps pour recevoir mes vues ?', answer: 'Les vues sont généralement livrées en 24-48h selon la quantité commandée.' },
  { question: 'Comment recharger mon compte ?', answer: 'Allez dans Portefeuille > Recharger et choisissez votre moyen de paiement préféré.' },
  { question: 'Mes vues sont-elles garanties ?', answer: 'Oui, nous offrons une garantie de remplacement si les vues diminuent dans les 30 jours.' },
  { question: 'Comment fonctionne le parrainage ?', answer: "Partagez votre code, et gagnez 500 points pour chaque ami qui s'inscrit !" },
];

const contactMethods = [
  { icon: FaWhatsapp, label: 'WhatsApp', value: '+237 XXX XXX XXX', action: 'https://wa.me/237XXXXXXXXX', color: 'text-[#25D366]' },
  { icon: Mail, label: 'Email', value: 'support@egbooster.com', action: 'mailto:support@egbooster.com', color: 'text-blue-600' },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          <h1 className="text-xl font-semibold text-gray-900">Support</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Contact Methods */}
        <div className="space-y-3">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.action}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <method.icon className={cn("w-6 h-6", method.color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{method.label}</p>
                <p className="text-sm text-gray-500">{method.value}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Envoyer un message</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-gray-900 mb-2 block">
                Sujet
              </Label>
              <Input
                id="subject"
                placeholder="Comment pouvons-nous vous aider ?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-gray-900 mb-2 block">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Décrivez votre problème ou question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 resize-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={() => {
                if (!subject || !message) {
                  toast.error('Veuillez remplir tous les champs');
                  return;
                }
                toast.success('Message envoyé !');
                setSubject('');
                setMessage('');
              }}
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 px-1">Questions fréquentes</h2>
          
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 pr-3">{item.question}</span>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-gray-400 transition-transform flex-shrink-0",
                    expandedFaq === index && "rotate-180"
                  )} />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}