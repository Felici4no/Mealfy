import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import Button from '../components/ui/Button';
import { MessageSquare, Mail, AlertTriangle, BookOpen } from 'lucide-react';
import './Support.css';

const Support: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="support-page">
      <AppHeader title="Suporte e Ajuda" showBack onBack={() => navigate(-1)} />
      
      <main className="content p-4">
        <h1 className="page-title text-primary mb-2">Como podemos ajudar?</h1>
        <p className="page-subtitle mb-6">A central de atendimento e dúvidas da sua comunidade digital solidária.</p>

        <section className="faq-section mb-8">
          <h2 className="section-subtitle mb-4 flex items-center gap-2"><BookOpen size={20} className="text-secondary" /> Dúvidas Frequentes</h2>
          
          <div className="faq-item">
            <h4 className="faq-question">Como funciona a doação via Gift Card?</h4>
            <p className="faq-answer">Seu valor é imediatamente cunhado em um Voucher exclusivo (ex: Itaú Alimentar). Nossa base mockada procura automaticamente uma família necessitada (Coração Partido 💔) em sua região e transfere o ticket fechado, protegendo o destinatário.</p>
          </div>
          
          <div className="faq-item">
            <h4 className="faq-question">Posso doar de forma anônima?</h4>
            <p className="faq-answer">Sim! Clicando em "Pular e doar anônimo" geramos uma tag efêmera no sistema e protegemos a transação, desvinculando-a totalmente do ranking oficial.</p>
          </div>

          <div className="faq-item">
            <h4 className="faq-question">O que significam os corações?</h4>
            <p className="faq-answer">Um coração partido (💔) demonstra famílias que precisam de doações hoje. Um coração preenchido (❤️) sinaliza famílias que já foram abençoadas pelo ecossistema Mealfy. Quando sua comunidade zerar os corações partidos, use a Doação Ampliada.</p>
          </div>
        </section>

        <section className="contact-section">
          <h2 className="section-subtitle mb-4 flex items-center gap-2"><AlertTriangle size={20} className="text-error" /> Atendimento Direto</h2>
          
          <div className="flex-col gap-3">
            <Button 
              variant="outline" 
              fullWidth 
              size="large"
              icon={<MessageSquare size={20} className="text-success" />}
              onClick={() => alert('Simulação: Lançando WhatsApp para +55 0800 000 000')}
            >
              Falar com Mealfy no WhatsApp
            </Button>
            
            <Button 
              variant="outline" 
              fullWidth 
              icon={<Mail size={20} />}
              onClick={() => alert('Simulação: Abrindo cliente de email (contato@mealfy.org)')}
            >
              Enviar um E-mail ao Suporte
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Support;
