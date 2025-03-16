
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CategoryItem } from '@/types';
import { fetchCategories } from '@/lib/categoryService';
import { Loader2, Cpu, Code, Database, BrainCircuit, Server, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  type: 'tech';
  title: string;
  className?: string;
}

// Map of icon strings to Lucide React components
const iconMap: Record<string, React.ElementType> = {
  Cpu,
  Code,
  Database,
  BrainCircuit,
  Server,
  FileText,
  Zap
};

const CategoryGrid: React.FC<CategoryGridProps> = ({ type, title, className }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCategories();
        // Filter categories by type if needed
        const filteredData = data.filter(category => category.type === type);
        setCategories(filteredData);
      } catch (err) {
        console.error(`Failed to load ${type} categories:`, err);
        setError(`Falha ao carregar categorias. Por favor, recarregue a página.`);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [type]);

  if (isLoading) {
    return (
      <div className={cn("mt-8", className)}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("mt-8", className)}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={cn("mt-8", className)}>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma categoria disponível no momento.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mt-8", className)}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          // Get the appropriate icon component
          const IconComponent = iconMap[category.icon] || Cpu;
          
          return (
            <Link 
              key={category.id}
              to={category.link}
              className="block p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className={cn("p-3 rounded-full bg-primary/10 mb-4", category.iconColor)}>
                  <IconComponent size={24} />
                </div>
                <h3 className="font-medium text-lg mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
