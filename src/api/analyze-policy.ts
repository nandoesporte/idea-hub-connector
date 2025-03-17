
import { Policy } from "@/types";

interface AnalyzeResponse {
  success: boolean;
  data?: Partial<Policy>;
  error?: string;
}

/**
 * Extracts text from a PDF document
 */
async function extractTextFromPdf(pdfUrl: string): Promise<string> {
  try {
    console.log('Extraindo texto do PDF:', pdfUrl);
    
    // If it's a mock URL in demo/dev mode, return simulated text
    if (pdfUrl.includes('example.com') || pdfUrl.includes('documento-simulado')) {
      console.log('URL de exemplo detectada, retornando texto simulado');
      return `APÓLICE DE SEGURO
      NÚMERO: AP123456
      SEGURADO: João Silva
      TELEFONE: (11) 98765-4321
      SEGURADORA: Seguradora Brasil
      VIGÊNCIA: ${new Date().toLocaleDateString()} a ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}
      VALOR DE COBERTURA: R$ 100.000,00
      PRÊMIO TOTAL: R$ 1.200,00
      TIPO: AUTOMÓVEL`;
    }

    // In a real implementation, we would load and parse the PDF
    // For example using PDF.js:
    /*
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    let textContent = '';

    for(let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      textContent += content.items.map(item => item.str).join(' ');
    }
    
    return textContent;
    */
    
    // For now, just return mock data
    return `APÓLICE DE SEGURO
      NÚMERO: AP123456
      SEGURADO: João Silva
      TELEFONE: (11) 98765-4321
      SEGURADORA: Seguradora Brasil
      VIGÊNCIA: ${new Date().toLocaleDateString()} a ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}
      VALOR DE COBERTURA: R$ 100.000,00
      PRÊMIO TOTAL: R$ 1.200,00
      TIPO: AUTOMÓVEL`;
  } catch (error) {
    console.error('Erro na extração de texto do PDF:', error);
    throw new Error('Falha ao extrair texto do PDF');
  }
}

/**
 * Analyzes a policy document to extract key information
 */
export const analyzePolicyDocument = async (fileUrl: string): Promise<Partial<Policy>> => {
  try {
    console.log('Analisando documento de apólice:', fileUrl);
    
    // 1. Extract text from PDF
    const pdfText = await extractTextFromPdf(fileUrl);
    console.log('Texto extraído do PDF:', pdfText);
    
    // 2. Use AI to analyze the document
    console.log('Enviando prompt para análise via OpenAI');
    
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('API key para OpenAI não encontrada. Configure VITE_OPENAI_API_KEY no ambiente');
      throw new Error('API key para OpenAI não configurada. Configure VITE_OPENAI_API_KEY nas variáveis de ambiente.');
    }
    
    // Call the OpenAI API
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em extrair informações de apólices de seguro. Extraia as informações solicitadas com precisão, exatamente como aparecem no documento. Retorne apenas o JSON, sem explicações adicionais.'
            },
            {
              role: 'user',
              content: `Extraia as seguintes informações desta apólice de seguro e retorne como JSON:
              policy_number (número da apólice), 
              customer_name (nome do segurado), 
              customer_phone (telefone do cliente), 
              insurer (nome da seguradora), 
              issue_date (data de emissão, em formato ISO), 
              expiry_date (data de vencimento, em formato ISO), 
              coverage_amount (valor de cobertura, como número), 
              premium (valor do prêmio, como número), 
              type (tipo do seguro: auto, vida, residencial, empresarial, etc).

              Texto da apólice:
              ${pdfText}`
            }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro na API da OpenAI:', error);
        throw new Error(`Erro na API da OpenAI: ${error.error?.message || 'Erro desconhecido'}`);
      }

      const result = await response.json();
      console.log('Resposta da OpenAI:', result);
      
      // Parse the JSON from the API response
      const responseContent = result.choices[0].message.content;
      console.log('Conteúdo da resposta:', responseContent);
      
      let extractedData;
      try {
        extractedData = JSON.parse(responseContent);
        console.log('Dados extraídos:', extractedData);
      } catch (parseError) {
        console.error('Erro ao analisar resposta JSON:', parseError);
        throw new Error('A resposta da OpenAI não está em formato JSON válido');
      }
      
      // Convert string dates to Date objects
      if (extractedData.issue_date) {
        extractedData.issue_date = new Date(extractedData.issue_date);
      }
      
      if (extractedData.expiry_date) {
        extractedData.expiry_date = new Date(extractedData.expiry_date);
      }
      
      // Convert string numbers to actual numbers if needed
      if (typeof extractedData.coverage_amount === 'string') {
        extractedData.coverage_amount = parseFloat(extractedData.coverage_amount.replace(/[^\d.,]/g, '').replace(',', '.'));
      }
      
      if (typeof extractedData.premium === 'string') {
        extractedData.premium = parseFloat(extractedData.premium.replace(/[^\d.,]/g, '').replace(',', '.'));
      }
      
      return extractedData;
    } catch (error) {
      console.error('Erro ao chamar a API da OpenAI:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro na análise do documento:', error);
    throw error;
  }
};

export default async function handler(req, res) {
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
    console.error('Error in analyze-policy API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao analisar documento'
    });
  }
}
