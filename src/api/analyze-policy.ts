
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
    
    // If it's a mock URL in dev mode, return simulated text
    if (pdfUrl.includes('example.com') || pdfUrl.includes('documento-simulado')) {
      console.log('URL de exemplo detectada, retornando texto simulado');
      return `APÓLICE DE SEGURO
      NÚMERO: AP123456
      SEGURADO: João Silva
      TELEFONE: (11) 98765-4321
      SEGURADORA: Seguradora Brasil
      VIGÊNCIA: 14/03/2025 a 14/03/2026
      VALOR DE COBERTURA: R$ 100.000,00
      PRÊMIO TOTAL: R$ 1.200,00
      TIPO: AUTOMÓVEL`;
    }

    // Para PDFs reais, podemos usar o pacote pdfjs-dist que já está instalado
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      
      // Em produção, precisamos carregar o PDF a partir da URL
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      let textContent = '';

      for(let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Corrigindo o código para lidar com diferentes tipos de itens TextItem e TextMarkedContent
        textContent += content.items.map(item => {
          // Verificar se o item é do tipo TextItem que possui a propriedade 'str'
          return 'str' in item ? item.str : '';
        }).join(' ');
      }
      
      console.log('Texto extraído do PDF real:', textContent.substring(0, 200) + '...');
      return textContent;
    } catch (pdfError) {
      console.error('Erro ao processar PDF com pdfjs:', pdfError);
      throw new Error('Falha ao processar PDF: ' + pdfError.message);
    }
  } catch (error) {
    console.error('Erro na extração de texto do PDF:', error);
    throw new Error('Falha ao extrair texto do PDF');
  }
}

/**
 * Extracts JSON from the LLM response text, which might be formatted with markdown code blocks
 */
function extractJsonFromLLMResponse(responseText: string): any {
  try {
    console.log('Extraindo JSON da resposta LLM:', responseText.substring(0, 100) + '...');
    
    // Try to extract JSON from a code block that might be in the response
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      // Found a code block, try to parse its content
      const jsonContent = jsonMatch[1].trim();
      console.log('JSON extraído do bloco de código:', jsonContent.substring(0, 100) + '...');
      return JSON.parse(jsonContent);
    }
    
    // If no code block, try to parse the entire text as JSON (it might just be a raw JSON)
    try {
      return JSON.parse(responseText);
    } catch (error) {
      // If it fails, try to find anything that looks like JSON in the response
      const possibleJson = responseText.match(/(\{[\s\S]*\})/);
      if (possibleJson && possibleJson[1]) {
        return JSON.parse(possibleJson[1]);
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao extrair JSON da resposta:', error);
    throw new Error('Falha ao extrair JSON válido da resposta do LLM');
  }
}

/**
 * Clean API key by removing whitespace and invalid characters
 */
function cleanApiKey(apiKey: string): string {
  if (!apiKey) return '';
  
  // Remove all whitespace, including invisible Unicode whitespace characters
  return apiKey.trim().replace(/\s+/g, '');
}

/**
 * Validates an OpenAI API key format
 */
function validateApiKey(apiKey: string): boolean {
  if (!apiKey) return false;
  
  // Updated validation for OpenAI API key format
  // - Should start with "sk-" (now allowing "sk-proj-" and "sk-_" prefixes)
  // - Should only contain alphanumeric characters, hyphens, and underscores after the "sk-" prefix
  // - Should be at least 20 characters long
  const hasValidPrefix = apiKey.startsWith('sk-');
  const hasValidFormat = /^sk-[a-zA-Z0-9_\-]+$/.test(apiKey);
  const isLongEnough = apiKey.length >= 20;
  
  return hasValidPrefix && hasValidFormat && isLongEnough;
}

/**
 * Analyzes a policy document to extract key information using OpenAI API
 */
export const analyzePolicyDocument = async (fileUrl: string): Promise<Partial<Policy>> => {
  try {
    console.log('Analisando documento de apólice:', fileUrl);
    
    // 1. Extract text from PDF
    const pdfText = await extractTextFromPdf(fileUrl);
    console.log('Texto extraído do PDF:', pdfText.substring(0, 500) + '...');
    
    // 2. Use OpenAI API to analyze the document
    console.log('Enviando prompt para análise via OpenAI API');
    
    // Get the API key from localStorage
    let apiKey = localStorage.getItem('openai_api_key');
    
    // Verify if we have an API key
    if (!apiKey) {
      console.warn('API key para OpenAI não encontrada ou vazia');
      throw new Error('API key para OpenAI não configurada. Por favor, configure a chave API nas configurações de administração.');
    }
    
    // Clean and validate the API key
    apiKey = cleanApiKey(apiKey);
    
    // Validate API key format
    if (!validateApiKey(apiKey)) {
      console.error('Formato de API key do OpenAI inválido');
      throw new Error(
        'A chave API do OpenAI está em um formato inválido. A chave deve começar com "sk-" ' +
        '(incluindo formatos como "sk-proj-" ou "sk-_"), ' +
        'não deve conter espaços ou caracteres especiais, e deve ter pelo menos 20 caracteres. ' +
        'Por favor, verifique a chave nas configurações de administração.'
      );
    }
    
    console.log('Usando API key do localStorage para OpenAI (validada e limpa)');
    
    // Call the OpenAI API with improved instructions for better data extraction
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Modelo recomendado e mais acessível
          messages: [
            {
              role: 'system',
              content: `Você é um assistente especializado em extrair informações de apólices de seguro brasileiras com extrema precisão. 
              Sua tarefa é analisar documentos de apólices e extrair dados estruturados exatamente como aparecem.
              Quando encontrar datas, mantenha sempre no formato brasileiro DD/MM/AAAA.
              Ao encontrar valores monetários, extraia apenas os números, convertendo para formato decimal.
              É FUNDAMENTAL que você retorne dados reais encontrados no documento, sem inventar informações.
              Retorne APENAS um objeto JSON válido, sem texto adicional ou explicativo.`
            },
            {
              role: 'user',
              content: `Analise cuidadosamente este documento de apólice de seguro e extraia as seguintes informações COM MÁXIMA PRECISÃO:

              - policy_number: o número da apólice, exatamente como aparece, remova apenas espaços extras
              - customer_name: nome completo do segurado/cliente
              - customer_phone: telefone do cliente no formato original
              - insurer: nome da seguradora exatamente como aparece
              - issue_date: data de início da vigência no formato DD/MM/YYYY
              - expiry_date: data final da vigência no formato DD/MM/YYYY
              - coverage_amount: valor de cobertura (apenas o número, sem R$ ou outros símbolos)
              - premium: valor do prêmio (apenas o número, sem R$ ou outros símbolos)
              - type: tipo do seguro (AUTOMÓVEL, VIDA, RESIDENCIAL, etc)

              INSTRUÇÕES IMPORTANTES:
              1. Busque atentamente por cada informação no documento. Olhe em todas as seções.
              2. Para datas, mantenha EXATAMENTE o formato brasileiro DD/MM/YYYY.
              3. Para valores monetários, converta valores como "R$ 1.234,56" para o número 1234.56
              4. Se não encontrar alguma informação com certeza, deixe o campo como string vazia.
              5. NUNCA invente dados que não estão claramente presentes no documento.
              6. Retorne APENAS um objeto JSON válido sem texto adicional.
              7. Se encontrar padrões como "vigência de XX/XX/XXXX a YY/YY/YYYY", extraia corretamente as datas de início e fim.

              Documento da apólice para análise:
              ${pdfText}`
            }
          ],
          temperature: 0.0, // Reduzido para maior precisão
          max_tokens: 1000
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
        // Use the helper function to extract JSON from the response
        extractedData = extractJsonFromLLMResponse(responseContent);
        console.log('Dados extraídos:', extractedData);
      } catch (parseError) {
        console.error('Erro ao analisar resposta JSON:', parseError);
        throw new Error('A resposta da OpenAI não está em formato JSON válido');
      }
      
      // Convert date strings to Date objects, preserving the original Brazilian format
      const formatBrazilianDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        
        // Check if date is in Brazilian format (DD/MM/YYYY)
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // Convert DD/MM/YYYY to YYYY-MM-DD for ISO format
          const day = parts[0].trim().padStart(2, '0');
          const month = parts[1].trim().padStart(2, '0');
          const year = parts[2].trim().padStart(4, '0');
          return new Date(`${year}-${month}-${day}T00:00:00`);
        }
        
        // If not in Brazilian format, try direct parsing
        return new Date(dateStr);
      };
      
      // Process the extracted data with better validation
      const processedData: Partial<Policy> = {
        policy_number: extractedData.policy_number || '',
        customer_name: extractedData.customer_name || '',
        customer_phone: extractedData.customer_phone || '',
        insurer: extractedData.insurer || '',
        issue_date: formatBrazilianDate(extractedData.issue_date),
        expiry_date: formatBrazilianDate(extractedData.expiry_date),
        coverage_amount: typeof extractedData.coverage_amount === 'string' 
          ? parseFloat(extractedData.coverage_amount.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'))
          : (typeof extractedData.coverage_amount === 'number' ? extractedData.coverage_amount : 0),
        premium: typeof extractedData.premium === 'string'
          ? parseFloat(extractedData.premium.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'))
          : (typeof extractedData.premium === 'number' ? extractedData.premium : 0),
        type: extractedData.type || ''
      };
      
      // Validate the processed data and log warnings for missing fields
      const missingFields = [];
      
      if (!processedData.policy_number) {
        console.warn('Número da apólice não encontrado no documento');
        missingFields.push('número da apólice');
      }
      
      if (!processedData.customer_name) {
        console.warn('Nome do cliente não encontrado no documento');
        missingFields.push('nome do cliente');
      }
      
      if (!processedData.insurer) {
        console.warn('Seguradora não encontrada no documento');
        missingFields.push('nome da seguradora');
      }
      
      if (isNaN(new Date(processedData.issue_date).getTime())) {
        console.warn('Data de início inválida');
        missingFields.push('data de início');
        processedData.issue_date = new Date();
      }
      
      if (isNaN(new Date(processedData.expiry_date).getTime())) {
        console.warn('Data de vencimento inválida');
        missingFields.push('data de vencimento');
        processedData.expiry_date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
      }
      
      // Se tiver muitos campos faltando, gerar um aviso apropriado
      if (missingFields.length > 2) {
        console.warn(`Múltiplos campos não encontrados: ${missingFields.join(', ')}`);
      }
      
      console.log('Dados processados e validados:', processedData);
      return processedData;
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
