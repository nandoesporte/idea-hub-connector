
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Separator } from '@/components/ui/separator';

const Privacy = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
        
        <div className="prose prose-stone dark:prose-invert max-w-none">
          <p className="lead">
            Última atualização: 15 de Julho de 2024
          </p>
          
          <p>
            Esta Política de Privacidade descreve como coletamos, usamos e compartilhamos suas informações 
            quando você utiliza nossos serviços. Valorizamos sua privacidade e nos comprometemos a proteger seus dados pessoais.
          </p>
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Informações que Coletamos</h2>
          <p>
            Podemos coletar diferentes tipos de informações, incluindo:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Informações pessoais como nome, email e telefone;</li>
            <li>Informações de utilização do site e dados técnicos;</li>
            <li>Informações de transações e histórico de contato.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Como Usamos suas Informações</h2>
          <p>
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornecer, manter e melhorar nossos serviços;</li>
            <li>Comunicar-nos com você sobre atualizações e novidades;</li>
            <li>Personalizar sua experiência e oferecer conteúdo relevante;</li>
            <li>Proteger nossos usuários e serviços contra atividades fraudulentas.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Compartilhamento de Informações</h2>
          <p>
            Não vendemos seus dados pessoais. Podemos compartilhar informações com:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Prestadores de serviços que nos auxiliam na operação;</li>
            <li>Parceiros de negócios, com seu consentimento;</li>
            <li>Autoridades legais, quando exigido por lei.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cookies e Tecnologias Semelhantes</h2>
          <p>
            Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, coletar dados de uso 
            e personalizar conteúdo. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Seus Direitos e Escolhas</h2>
          <p>
            Você tem direito a:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acessar, corrigir ou excluir seus dados pessoais;</li>
            <li>Recusar o processamento de seus dados em certas circunstâncias;</li>
            <li>Retirar seu consentimento a qualquer momento;</li>
            <li>Solicitar a portabilidade de seus dados.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. A versão mais recente estará sempre disponível em nosso site.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Entre em Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta política, entre em contato pelo email: privacidade@exemplo.com
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
