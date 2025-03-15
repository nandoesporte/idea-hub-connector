
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Separator } from '@/components/ui/separator';

const Terms = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
        
        <div className="prose prose-stone dark:prose-invert max-w-none">
          <p className="lead">
            Última atualização: 15 de Julho de 2024
          </p>
          
          <p>
            Bem-vindo aos nossos Termos de Serviço. Por favor, leia com atenção estes termos antes de utilizar nossa plataforma.
          </p>
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou utilizar nossos serviços, você concorda em cumprir e ficar vinculado aos presentes Termos de Serviço.
            Se você não concordar com algum aspecto destes termos, não utilize nossos serviços.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Descrição dos Serviços</h2>
          <p>
            Fornecemos uma plataforma para desenvolvimento de projetos tecnológicos, incluindo websites, aplicativos, 
            sistemas de gestão e soluções personalizadas. Nossos serviços estão sujeitos a alterações e atualizações 
            sem aviso prévio.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo disponibilizado em nossa plataforma, incluindo logotipos, textos, imagens e código, 
            está protegido por direitos autorais e outras leis de propriedade intelectual.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitação de Responsabilidade</h2>
          <p>
            Não nos responsabilizamos por quaisquer danos diretos, indiretos, incidentais ou consequenciais 
            decorrentes do uso ou incapacidade de usar nossos serviços.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Modificações dos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações entram em vigor 
            imediatamente após sua publicação na plataforma.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contato</h2>
          <p>
            Para esclarecer dúvidas sobre estes termos, entre em contato através do e-mail: termos@exemplo.com
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
