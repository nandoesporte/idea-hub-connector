
import React from 'react';
import { ProjectCategory } from '@/types';

interface CategoryOption {
  value: ProjectCategory;
  label: string;
  description: string;
}

const categories: CategoryOption[] = [
  {
    value: 'website',
    label: 'Website',
    description: 'Sites institucionais, landing pages, blogs e portfólios',
  },
  {
    value: 'e-commerce',
    label: 'E-commerce',
    description: 'Lojas virtuais, marketplaces e plataformas de vendas online',
  },
  {
    value: 'mobile-app',
    label: 'Aplicativo Móvel',
    description: 'Apps para iOS, Android ou multiplataforma',
  },
  {
    value: 'desktop-app',
    label: 'Aplicativo Desktop',
    description: 'Software para Windows, macOS ou Linux',
  },
  {
    value: 'automation',
    label: 'Automação',
    description: 'Scripts, automação de processos e fluxos de trabalho',
  },
  {
    value: 'integration',
    label: 'Integração',
    description: 'APIs, webhooks e integrações entre sistemas',
  },
  {
    value: 'ai-solution',
    label: 'Solução com IA',
    description: 'Chatbots, análise de dados e IA generativa',
  },
  {
    value: 'other',
    label: 'Outro',
    description: 'Outro tipo de projeto não listado acima',
  },
];

interface CategorySelectorProps {
  selectedCategory: ProjectCategory | '';
  onSelectCategory: (category: ProjectCategory) => void;
  className?: string;
}

const CategorySelector = ({
  selectedCategory,
  onSelectCategory,
  className,
}: CategorySelectorProps) => {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.value}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all duration-200
              ${selectedCategory === category.value 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'hover:border-primary/50 hover:bg-primary/5'
              }
            `}
            onClick={() => onSelectCategory(category.value)}
          >
            <div className="flex items-start space-x-3">
              <div className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${
                selectedCategory === category.value ? 'border-primary' : 'border-muted-foreground'
              }`}>
                {selectedCategory === category.value && (
                  <div className="h-3 w-3 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">{category.label}</p>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
