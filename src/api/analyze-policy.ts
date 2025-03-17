
import { Policy } from "@/types";

interface AnalyzeResponse {
  success: boolean;
  data?: Partial<Policy>;
  error?: string;
}

const mockPolicyData = {
  policy_number: "AP123456",
  customer_name: "João Silva",
  customer_phone: "(11) 98765-4321",
  insurer: "Seguradora Brasil",
  issue_date: new Date(),
  expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  coverage_amount: 100000,
  premium: 1200,
  type: "auto",
  notes: "Simulação de apólice para fins de demonstração"
};

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
    
    // 2. Use AI to analyze the document
    console.log('Enviando prompt para análise via OpenAI');
    
    // Check if we're in development or demo mode
    if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('Ambiente de desenvolvimento - retornando dados simulados');
      // Return mock data for development
      return mockPolicyData;
    }
    
    // In a real implementation, we would use OpenAI's API
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('API key para OpenAI não encontrada, retornando dados simulados');
      return mockPolicyData;
    }
    
    // Here we would call the OpenAI API
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that extracts insurance policy information from text.'
          },
          {
            role: 'user',
            content: `Extract the following information from this insurance policy document and return it as JSON:
            policy_number, customer_name, customer_phone, insurer, issue_date, expiry_date, coverage_amount, premium, type.
            
            Here's the document text:
            ${pdfText}`
          }
        ]
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${result.error?.message || 'Unknown error'}`);
    }
    
    // Parse the JSON from the API response
    const responseContent = result.choices[0].message.content;
    const extractedData = JSON.parse(responseContent);
    
    return {
      ...extractedData,
      issue_date: new Date(extractedData.issue_date),
      expiry_date: new Date(extractedData.expiry_date)
    };
    */
    
    // For now, just return mock data
    return mockPolicyData;
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
