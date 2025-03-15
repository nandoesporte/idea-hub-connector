
import React from 'react';
import MainLayout from '@/layouts/MainLayout';

const Privacy = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="lead">
            Esta Política de Privacidade descreve como coletamos, usamos e compartilhamos suas informações pessoais quando você utiliza nossos serviços.
          </p>
          
          <h2>1. Coleta de Informações</h2>
          <p>
            Coletamos informações quando você se registra em nosso site, faz login, preenche formulários, interage com nossos serviços ou se comunica conosco.
          </p>
          
          <h3>1.1 Informações fornecidas por você</h3>
          <p>
            Podemos coletar seu nome, endereço de e-mail, número de telefone, informações de pagamento e outras informações que você optar por fornecer.
          </p>
          
          <h3>1.2 Informações coletadas automaticamente</h3>
          <p>
            Quando você acessa nosso site, podemos coletar automaticamente informações sobre seu dispositivo, incluindo tipo de navegador, endereço IP, fuso horário e cookies.
          </p>
          
          <h2>2. Uso de Informações</h2>
          <p>
            Utilizamos suas informações para:
          </p>
          <ul>
            <li>Fornecer, manter e melhorar nossos serviços</li>
            <li>Processar transações e enviar notificações relacionadas</li>
            <li>Comunicar-se com você sobre atualizações, suporte e recursos</li>
            <li>Personalizar sua experiência e fornecer conteúdo relevante</li>
            <li>Analisar como você utiliza nossos serviços</li>
          </ul>
          
          <h2>3. Compartilhamento de Informações</h2>
          <p>
            Não vendemos, comercializamos ou alugamos suas informações pessoais para terceiros. Podemos compartilhar informações com:
          </p>
          <ul>
            <li>Prestadores de serviços que nos auxiliam na operação dos serviços</li>
            <li>Parceiros comerciais com seu consentimento</li>
            <li>Autoridades quando exigido por lei</li>
          </ul>
          
          <h2>4. Segurança</h2>
          <p>
            Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
          
          <h2>5. Cookies</h2>
          <p>
            Utilizamos cookies para melhorar sua experiência, entender como você utiliza nossos serviços e personalizar nosso conteúdo.
          </p>
          
          <h2>6. Seus Direitos</h2>
          <p>
            Você tem o direito de:
          </p>
          <ul>
            <li>Acessar, corrigir ou excluir suas informações pessoais</li>
            <li>Restringir ou opor-se ao processamento de suas informações</li>
            <li>Solicitar a portabilidade de seus dados</li>
            <li>Retirar seu consentimento a qualquer momento</li>
          </ul>
          
          <h2>7. Alterações nesta Política</h2>
          <p>
            Reservamo-nos o direito de atualizar esta política periodicamente. Notificaremos você sobre quaisquer alterações significativas.
          </p>
          
          <h2>8. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco pelo email: privacidade@empresa.com
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Última atualização: 01 de janeiro de 2023
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
