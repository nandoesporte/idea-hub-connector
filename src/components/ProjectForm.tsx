
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import CategorySelector from './CategorySelector';
import { ProjectCategory } from '@/types';

const ProjectForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    features: '',
  });
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | ''>('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: ProjectCategory) => {
    setSelectedCategory(category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error("Por favor, selecione uma categoria para o seu projeto.");
      return;
    }
    
    if (!formData.title || !formData.description) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here would be the API call to submit the data
      // For now we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Projeto enviado com sucesso! Nossa equipe entrará em contato em breve.");
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        budget: '',
        timeline: '',
        features: '',
      });
      setSelectedCategory('');
      setCurrentStep(1);
      
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar o projeto. Por favor, tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedCategory) {
      toast.error("Por favor, selecione uma categoria para continuar.");
      return;
    }
    
    if (currentStep === 2 && (!formData.title || !formData.description)) {
      toast.error("Por favor, preencha o título e a descrição para continuar.");
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Categoria do Projeto</h2>
            <p className="text-muted-foreground">Selecione a categoria que melhor descreve seu projeto</p>
          </div>
          
          <CategorySelector 
            selectedCategory={selectedCategory} 
            onSelectCategory={handleCategorySelect} 
          />
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Informações Básicas</h2>
            <p className="text-muted-foreground">Conte-nos mais sobre sua ideia</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Projeto *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Site para minha loja de roupas"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva detalhadamente sua ideia e o que você espera alcançar..."
                rows={6}
                required
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Detalhes Adicionais</h2>
            <p className="text-muted-foreground">Preencha estas informações opcionais para nos ajudar a entender melhor seu projeto</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento Estimado</Label>
              <Input
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Ex: R$ 5.000 - R$ 10.000"
              />
              <p className="text-xs text-muted-foreground">Essa informação é apenas uma referência, não se preocupe se não tiver certeza.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeline">Prazo Desejado</Label>
              <Input
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="Ex: 1 mês, 3 meses, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="features">Funcionalidades Desejadas</Label>
              <Textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleChange}
                placeholder="Liste as principais funcionalidades que você gostaria que seu projeto tivesse..."
                rows={4}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        {currentStep > 1 ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
        ) : (
          <div></div> // Empty div to maintain flex spacing
        )}
        
        {currentStep < totalSteps ? (
          <Button 
            type="button" 
            onClick={nextStep}
          >
            Continuar
          </Button>
        ) : (
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="shadow-md"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Projeto'}
          </Button>
        )}
      </div>
      
      <div className="flex justify-center space-x-2 pt-4">
        {[...Array(totalSteps)].map((_, index) => (
          <div 
            key={index}
            className={`h-2 w-10 rounded-full transition-colors ${
              currentStep > index 
                ? 'bg-primary' 
                : currentStep === index + 1 
                  ? 'bg-primary/50' 
                  : 'bg-gray-200'
            }`}
          ></div>
        ))}
      </div>
    </form>
  );
};

export default ProjectForm;
