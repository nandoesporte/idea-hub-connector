
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import CategorySelector from './CategorySelector';
import { ProjectCategory } from '@/types';
import { Check, Clock, FileUp, Info, TrashIcon } from 'lucide-react';
import FeatureInput from './FeatureInput';

const ProjectForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    features: '',
    urgency: 'normal', // new field
    attachments: [] as File[], // new field
  });
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | ''>('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Increased to add review step

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: ProjectCategory) => {
    setSelectedCategory(category);
  };

  const handleUrgencySelect = (urgency: string) => {
    setFormData((prev) => ({ ...prev, urgency }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 5 files
      if (formData.attachments.length + newFiles.length > 5) {
        toast.error("Máximo de 5 arquivos permitidos");
        return;
      }
      
      // Check file size (limit to 5MB each)
      const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error("Arquivos devem ter no máximo 5MB cada");
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const addFeature = (feature: string) => {
    if (feature.trim() && !featuresList.includes(feature.trim())) {
      setFeaturesList([...featuresList, feature.trim()]);
      setFormData(prev => ({ ...prev, features: '' }));
    }
  };

  const removeFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
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
        urgency: 'normal',
        attachments: [],
      });
      setFeaturesList([]);
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

  // Get category label
  const getCategoryLabel = (category: ProjectCategory | '') => {
    switch (category) {
      case 'website': return 'Website';
      case 'e-commerce': return 'E-commerce';
      case 'mobile-app': return 'Aplicativo Móvel';
      case 'desktop-app': return 'Aplicativo Desktop';
      case 'automation': return 'Automação';
      case 'integration': return 'Integração';
      case 'ai-solution': return 'Solução com IA';
      case 'other': return 'Outro';
      default: return '';
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
                className="transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Urgência do Projeto</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {['baixa', 'normal', 'alta'].map((urgency) => (
                  <div
                    key={urgency}
                    className={`border rounded-lg p-3 cursor-pointer transition-all flex items-center space-x-2
                      ${formData.urgency === urgency 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    onClick={() => handleUrgencySelect(urgency)}
                  >
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      formData.urgency === urgency ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {formData.urgency === urgency && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="capitalize">{urgency}</div>
                  </div>
                ))}
              </div>
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
                className="transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Funcionalidades Desejadas</Label>
              <FeatureInput 
                value={formData.features} 
                onChange={(e) => handleChange(e)}
                onAdd={addFeature}
              />

              {featuresList.length > 0 && (
                <div className="mt-3 space-y-2">
                  {featuresList.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between bg-muted/30 p-2 rounded-md group"
                    >
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFeature(index)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Label>Anexos (opcional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/10 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Arraste arquivos ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground mt-1">Máximo de 5 arquivos (5MB cada)</p>
                </label>
              </div>

              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                      <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Revisar e Enviar</h2>
            <p className="text-muted-foreground">Verifique as informações abaixo antes de enviar seu projeto</p>
          </div>
          
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="divide-y">
              <div className="grid grid-cols-3 p-4">
                <div className="font-medium">Categoria</div>
                <div className="col-span-2">
                  {getCategoryLabel(selectedCategory)}
                </div>
              </div>

              <div className="grid grid-cols-3 p-4">
                <div className="font-medium">Título</div>
                <div className="col-span-2">{formData.title}</div>
              </div>

              <div className="grid grid-cols-3 p-4">
                <div className="font-medium">Urgência</div>
                <div className="col-span-2 capitalize">{formData.urgency}</div>
              </div>

              <div className="grid grid-cols-3 p-4">
                <div className="font-medium">Descrição</div>
                <div className="col-span-2 whitespace-pre-line">{formData.description}</div>
              </div>

              {(formData.budget || formData.timeline) && (
                <div className="grid grid-cols-3 p-4">
                  <div className="font-medium">Orçamento e Prazo</div>
                  <div className="col-span-2">
                    {formData.budget && <div>Orçamento: {formData.budget}</div>}
                    {formData.timeline && <div>Prazo: {formData.timeline}</div>}
                  </div>
                </div>
              )}

              {featuresList.length > 0 && (
                <div className="grid grid-cols-3 p-4">
                  <div className="font-medium">Funcionalidades</div>
                  <div className="col-span-2">
                    <ul className="list-disc pl-5 space-y-1">
                      {featuresList.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {formData.attachments.length > 0 && (
                <div className="grid grid-cols-3 p-4">
                  <div className="font-medium">Anexos</div>
                  <div className="col-span-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="text-sm py-1">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 p-2 text-sm bg-muted/30 rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Após o envio, nossa equipe analisará sua solicitação e entrará em contato em até 48 horas úteis.
            </span>
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
