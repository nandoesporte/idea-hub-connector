
import React from 'react';
import MainLayout from '@/layouts/MainLayout';

const Terms = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="lead">
            Bem-vindo aos Termos de Serviço da nossa plataforma. Este documento estabelece os termos e condições para o uso de nossos serviços.
          </p>
          
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou utilizar nossos serviços, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não poderá acessar ou utilizar nossos serviços.
          </p>
          
          <h2>2. Elegibilidade</h2>
          <p>
            Para utilizar nossos serviços, você deve ter pelo menos 18 anos de idade ou possuir consentimento legal de um responsável.
          </p>
          
          <h2>3. Contas de Usuário</h2>
          <p>
            Quando você cria uma conta conosco, você é responsável por manter a segurança de sua conta e senha. A empresa não será responsável por qualquer perda ou dano resultante de sua falha em cumprir com esta obrigação de segurança.
          </p>
          
          <h2>4. Uso Aceitável</h2>
          <p>
            Você concorda em não utilizar o serviço para qualquer finalidade que seja ilegal ou proibida por estes Termos.
          </p>
          
          <h2>5. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo, recursos e funcionalidades disponíveis através de nosso serviço são propriedade da empresa e são protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
          </p>
          
          <h2>6. Limitação de Responsabilidade</h2>
          <p>
            Em nenhum caso a empresa, seus diretores, funcionários ou agentes serão responsáveis por quaisquer danos indiretos, punitivos, incidentais, especiais, consequenciais ou exemplares.
          </p>
          
          <h2>7. Alterações nos Termos</h2>
          <p>
            Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. É sua responsabilidade revisar estes Termos periodicamente para verificar mudanças.
          </p>
          
          <h2>8. Encerramento</h2>
          <p>
            Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.
          </p>
          
          <h2>9. Lei Aplicável</h2>
          <p>
            Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições de conflitos de leis.
          </p>
          
          <h2>10. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco pelo email: termos@empresa.com
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Última atualização: 01 de janeiro de 2023
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
