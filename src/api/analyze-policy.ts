
import { Policy } from '@/types';

// Simulação da chamada ao GPT-4 para análise de documentos de apólice
export async function analyzePolicyDocument(fileUrl: string): Promise<Partial<Policy>> {
  console.log('Analisando documento de apólice:', fileUrl);
  
  // Em ambiente de produção, aqui faríamos uma chamada para uma API que utiliza GPT-4
  // para analisar o PDF da apólice e extrair as informações relevantes
  
  // Simulação de processamento (em produção, isso seria uma chamada real ao GPT-4)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Dados que seriam extraídos pelo GPT-4
      const hoje = new Date();
      const dataVencimento = new Date();
      dataVencimento.setFullYear(hoje.getFullYear() + 1); // 1 ano de vigência

      // Calculando data de lembrete (30 dias antes do vencimento)
      const dataLembrete = new Date(dataVencimento);
      dataLembrete.setDate(dataLembrete.getDate() - 30);
      
      resolve({
        policy_number: `AP${Math.floor(Math.random() * 1000000)}`,
        customer_name: 'Nome do Cliente Extraído',
        customer_phone: '(11) 99999-9999',
        issue_date: hoje,
        expiry_date: dataVencimento,
        reminder_date: dataLembrete,
        insurer: 'Seguradora Identificada',
        coverage_amount: 150000 + Math.floor(Math.random() * 50000),
        premium: 2500 + Math.floor(Math.random() * 1000),
        type: 'auto',
        notes: 'Informações extraídas automaticamente via IA'
      });
    }, 2000); // Simulando o tempo de processamento
  });
}

// Endpoint que será chamado pelo frontend
export async function analyzePolicy(req, res) {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL do arquivo não fornecida' 
      });
    }
    
    const policyData = await analyzePolicyDocument(fileUrl);
    
    return res.status(200).json({
      success: true,
      data: policyData
    });
  } catch (error) {
    console.error('Erro ao analisar documento:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao analisar o documento'
    });
  }
}
