
import { supabase } from "@/lib/supabase";
import { Policy, PolicyFile } from "@/types";
import { toast } from "sonner";

const STORAGE_BUCKET = 'policy_documents';

// Função simplificada que apenas retorna true
export const initializeStorage = async () => {
  return true;
};

// Fetch policies
export const fetchPolicies = async (userId: string) => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching policies:", error);
    toast.error("Erro ao carregar apólices");
    return [];
  }

  return data.map(policy => ({
    id: policy.id,
    userId: policy.user_id,
    policyNumber: policy.policy_number,
    customerName: policy.customer,
    issueDate: new Date(policy.start_date),
    expiryDate: new Date(policy.end_date),
    insurer: policy.insurer,
    coverageAmount: parseFloat(policy.coverage_amount.replace(/[^0-9.]/g, '')),
    premium: parseFloat(policy.premium_value.replace(/[^0-9.]/g, '')),
    status: policy.status,
    type: policy.type || 'general',
    createdAt: new Date(policy.created_at),
    updatedAt: new Date(policy.created_at),
    attachmentUrl: policy.document_url,
  }));
};

// Delete policy
export const deletePolicy = async (id: string) => {
  const { error } = await supabase
    .from('policies')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error("Error deleting policy");
  }
  return id;
};

// Upload and process policy - simplificada para foco no upload e análise
export const uploadAndProcessPolicy = async (
  file: File, 
  userId: string, 
  setUploadingFile: React.Dispatch<React.SetStateAction<PolicyFile | null>>,
  onSuccess: () => void
) => {
  if (!userId) {
    toast.error("Usuário não autenticado");
    setUploadingFile(null);
    return;
  }

  try {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadingFile(prev => {
        if (!prev) return null;
        
        const newProgress = Math.min(prev.progress + 5, 95);
        return {
          ...prev,
          progress: newProgress
        };
      });
    }, 100);

    try {
      // Upload do arquivo para o Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${userId}/${fileName}`; // Simplificado: pasta direta com o ID do usuário
      
      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
  
      clearInterval(progressInterval);
      
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao fazer upload do arquivo' } : null);
        toast.error("Erro ao fazer upload do arquivo");
        return;
      }
  
      // Set progress to 100% for upload complete
      setUploadingFile(prev => prev ? { ...prev, progress: 100, status: 'processing' } : null);
  
      // Get the file URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
  
      // Convert PDF to base64 for GPT-4 Vision
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result?.toString().split(',')[1];
          
          // Call GPT-4 Vision to analyze the PDF
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-policy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              pdfBase64: base64Data,
              fileName: file.name
            }),
          });
  
          if (!response.ok) {
            throw new Error('Failed to analyze PDF');
          }
  
          const policyData = await response.json();
  
          // Use the extracted data to create a policy record
          const today = new Date();
          
          // Set policy status based on date
          let policyStatus: Policy['status'] = "active";
          if (new Date(today) > new Date(policyData.expiryDate)) {
            policyStatus = "expired";
          } else if (new Date(today) < new Date(policyData.issueDate)) {
            policyStatus = "pending";
          }
          
          // Save the policy to Supabase
          const { error: saveError } = await supabase
            .from('policies')
            .insert({
              user_id: userId,
              policy_number: policyData.policyNumber,
              insurer: policyData.insurer,
              customer: policyData.customerName,
              start_date: new Date(policyData.issueDate).toISOString(),
              end_date: new Date(policyData.expiryDate).toISOString(),
              coverage_amount: policyData.coverageAmount,
              premium_value: policyData.premium,
              status: policyStatus,
              document_url: publicUrl,
              file_name: file.name
            });
  
          if (saveError) {
            console.error("Error saving policy:", saveError);
            setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao salvar a apólice' } : null);
            toast.error("Erro ao salvar a apólice");
            return;
          }
          
          // Update success status
          setUploadingFile(prev => prev ? { ...prev, status: 'success' } : null);
          toast.success("Apólice processada com sucesso!");
          
          // Call success callback
          onSuccess();
          
          // Reset upload state after a delay
          setTimeout(() => {
            setUploadingFile(null);
          }, 2000);
          
        } catch (error) {
          console.error("Error analyzing policy:", error);
          setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao analisar o documento' } : null);
          toast.error("Erro ao analisar o documento PDF");
          
          setTimeout(() => {
            setUploadingFile(null);
          }, 3000);
        }
      };
  
      reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao ler o arquivo' } : null);
        toast.error("Erro ao ler o arquivo");
      };
  
      reader.readAsDataURL(file);
    } catch (uploadProcessError) {
      clearInterval(progressInterval);
      console.error("Error in upload process:", uploadProcessError);
      setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro no processo de upload' } : null);
      toast.error("Erro no processo de upload");
    }
  } catch (error) {
    console.error("Error processing policy:", error);
    setUploadingFile(prev => prev ? { ...prev, status: 'error', error: 'Erro ao processar o arquivo' } : null);
    toast.error("Erro ao processar a apólice");
    
    setTimeout(() => {
      setUploadingFile(null);
    }, 3000);
  }
};
