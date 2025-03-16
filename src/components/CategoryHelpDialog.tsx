
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';
import { ProjectCategory } from '@/types';

interface CategoryExplanation {
  title: string;
  description: string;
  examples: string[];
  whenToChoose: string;
}

const categoryExplanations: Record<ProjectCategory, CategoryExplanation> = {
  'website': {
    title: 'Website',
    description: 'Um website é uma presença online básica para sua empresa ou projeto pessoal.',
    examples: [
      'Site institucional para sua empresa',
      'Portfolio profissional para mostrar seu trabalho',
      'Blog pessoal ou empresarial',
      'Site de evento único como casamento ou conferência'
    ],
    whenToChoose: 'Escolha esta opção quando precisar de uma presença online simples, principalmente para apresentar informações sobre você, sua empresa ou seu trabalho.'
  },
  'e-commerce': {
    title: 'E-commerce',
    description: 'Uma loja virtual completa para vender produtos ou serviços online.',
    examples: [
      'Loja de roupas online',
      'Marketplace para vários vendedores',
      'Site para venda de produtos artesanais',
      'Plataforma de cursos ou conteúdo digital'
    ],
    whenToChoose: 'Escolha esta opção quando quiser vender produtos ou serviços diretamente pela internet, com pagamento online e gestão de pedidos.'
  },
  'mobile-app': {
    title: 'Aplicativo Móvel',
    description: 'Um aplicativo que as pessoas podem baixar e instalar nos celulares ou tablets.',
    examples: [
      'Aplicativo de delivery',
      'App para gerenciar tarefas pessoais',
      'Jogo mobile',
      'App de fidelidade para sua loja'
    ],
    whenToChoose: 'Ideal quando você precisa que os usuários acessem sua solução diretamente de seus smartphones, mesmo sem internet, ou quando precisa de recursos como notificações push e acesso à câmera ou GPS.'
  },
  'desktop-app': {
    title: 'Aplicativo Desktop',
    description: 'Um programa que é instalado em computadores Windows, Mac ou Linux.',
    examples: [
      'Software de gestão para pequenos negócios',
      'Programa para edição de imagens',
      'Aplicativo para designers ou artistas',
      'Sistema para ponto de venda (PDV)'
    ],
    whenToChoose: 'Escolha quando sua solução precisa de mais poder de processamento, trabalhar com arquivos locais ou funcionar sem internet.'
  },
  'automation': {
    title: 'Automação',
    description: 'Sistemas que automatizam tarefas repetitivas para economizar seu tempo e reduzir erros.',
    examples: [
      'Robô para preenchimento automático de planilhas',
      'Sistema para envio automático de e-mails',
      'Automação de publicações em redes sociais',
      'Coleta automática de dados de sites'
    ],
    whenToChoose: 'Perfeito para quando você gasta muito tempo em tarefas repetitivas que poderiam ser feitas por um computador.'
  },
  'integration': {
    title: 'Integração',
    description: 'Conexão entre diferentes sistemas e aplicativos para que funcionem juntos.',
    examples: [
      'Integração entre seu e-commerce e sistema de estoque',
      'Conexão do seu CRM com ferramentas de marketing',
      'Sincronização de dados entre plataformas',
      'Importação/exportação automática de dados'
    ],
    whenToChoose: 'Ideal quando você usa vários sistemas que não se comunicam e precisa transferir dados manualmente entre eles.'
  },
  'ai-solution': {
    title: 'Solução com IA',
    description: 'Aplicações que usam inteligência artificial para resolver problemas específicos.',
    examples: [
      'Chatbot de atendimento para seu site',
      'Sistema de recomendação de produtos',
      'Análise automática de textos ou imagens',
      'Assistente virtual para sua área de trabalho'
    ],
    whenToChoose: 'Escolha quando precisa de sistemas inteligentes que aprendem com dados, reconhecem padrões ou automatizam decisões complexas.'
  },
  'web-app': {
    title: 'Aplicativo Web',
    description: 'Uma aplicação completa que roda no navegador com funcionalidades avançadas.',
    examples: [
      'Sistema de gestão financeira online',
      'Ferramenta de gerenciamento de projetos',
      'Plataforma de aprendizado',
      'Dashboard para análise de dados'
    ],
    whenToChoose: 'Ideal para aplicações complexas que precisam ser acessadas de qualquer lugar, sem necessidade de instalação.'
  },
  'other': {
    title: 'Outro',
    description: 'Qualquer tipo de projeto que não se encaixe nas categorias acima.',
    examples: [
      'Consultoria em tecnologia',
      'Projeto de pesquisa ou educacional',
      'Soluções de IoT (Internet das Coisas)',
      'Projetos experimentais ou inovadores'
    ],
    whenToChoose: 'Selecione esta opção se sua ideia é única ou combina elementos de várias categorias. Descreva detalhadamente o que precisa no formulário.'
  }
};

const CategoryCard = ({ category, explanation }: { category: ProjectCategory, explanation: CategoryExplanation }) => (
  <div className="border rounded-lg p-4 space-y-3">
    <h3 className="text-lg font-semibold">{explanation.title}</h3>
    <p className="text-muted-foreground">{explanation.description}</p>
    
    <div>
      <h4 className="font-medium text-sm mb-1">Exemplos:</h4>
      <ul className="list-disc list-inside space-y-1 text-sm">
        {explanation.examples.map((example, index) => (
          <li key={index}>{example}</li>
        ))}
      </ul>
    </div>
    
    <div className="pt-2">
      <h4 className="font-medium text-sm mb-1">Quando escolher:</h4>
      <p className="text-sm text-muted-foreground">{explanation.whenToChoose}</p>
    </div>
  </div>
);

const CategoryHelpDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <HelpCircle className="h-4 w-4" />
          Ajuda com categorias
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guia de Categorias de Projeto</DialogTitle>
          <DialogDescription>
            Entenda melhor cada tipo de projeto e escolha o que melhor se adequa à sua necessidade
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {(Object.keys(categoryExplanations) as ProjectCategory[]).map((category) => (
            <CategoryCard 
              key={category} 
              category={category} 
              explanation={categoryExplanations[category]} 
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryHelpDialog;
