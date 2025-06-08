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
    
    // REMOVIDO: Verificação de URL simulada que estava retornando dados fictícios
    // Agora sempre tentamos extrair o texto real do PDF
    
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      
      // Carregar o PDF a partir da URL real
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      let textContent = '';

      console.log(`PDF carregado com ${pdf.numPages} páginas`);

      for(let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Extrair texto de cada item na página
        const pageText = content.items.map(item => {
          return 'str' in item ? item.str : '';
        }).join(' ');
        
        textContent += pageText + ' ';
        console.log(`Página ${i} processada, texto extraído: ${pageText.substring(0, 100)}...`);
      }
      
      console.log('Texto completo extraído do PDF:', textContent.substring(0, 500) + '...');
      
      // Verificar se conseguimos extrair texto real
      if (!textContent || textContent.trim().length < 10) {
        throw new Error('Não foi possível extrair texto do PDF. O arquivo pode estar protegido, ser uma imagem ou estar corrompido.');
      }
      
      return textContent.trim();
      
    } catch (pdfError) {
      console.error('Erro ao processar PDF com pdfjs:', pdfError);
      throw new Error(`Falha ao processar PDF: ${pdfError.message}`);
    }
  } catch (error) {
    console.error('Erro na extração de texto do PDF:', error);
    throw new Error('Falha ao extrair texto do PDF: ' + error.message);
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
    
    // 1. Extract text from PDF - AGORA SEM DADOS SIMULADOS
    const pdfText = await extractTextFromPdf(fileUrl);
    console.log('Texto extraído do PDF (primeiros 1000 caracteres):', pdfText.substring(0, 1000));
    
    // Verificar se temos texto real extraído
    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error('Não foi possível extrair texto suficiente do documento PDF. Verifique se o arquivo é um PDF válido e legível.');
    }
    
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
          model: "gpt-4o", // Usando modelo mais poderoso para melhor extração
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em análise de documentos de apólices de seguro brasileiras.
              Sua missão é extrair EXCLUSIVAMENTE os dados REAIS que estão claramente visíveis no documento fornecido.
              
              REGRAS FUNDAMENTAIS:
              1. JAMAIS invente ou crie dados que não estejam explicitamente no documento
              2. Se um dado não estiver visível ou claro, retorne string vazia ou null
              3. Procure minuciosamente por cada informação em todo o texto
              4. Mantenha os formatos originais (datas em DD/MM/YYYY, valores como aparecem)
              5. Para valores monetários, extraia apenas números (sem R$, pontos ou vírgulas)
              6. Retorne APENAS JSON válido, sem explicações adicionais
              7. NUNCA use dados de exemplo como "João Silva", "AP123456", etc.
              8. Se não encontrar uma informação específica, deixe o campo vazio
              
              IMPORTANTE: Analise TODO o texto fornecido, não apenas partes dele.`
            },
            {
              role: 'user',
              content: `Analise este documento de apólice de seguro COMPLETO e extraia APENAS as informações que estão CLARAMENTE PRESENTES.

ATENÇÃO: Este é o texto REAL extraído do documento PDF. NÃO use dados fictícios ou de exemplo:

TEXTO COMPLETO DO DOCUMENTO:
${pdfText}

Extraia as seguintes informações EXATAMENTE como aparecem no documento:

{
  "policy_number": "número da apólice (procure por 'apólice', 'nº', 'number', etc.)",
  "customer_name": "nome completo do segurado/cliente (procure por 'segurado', 'contratante', 'cliente')",
  "customer_phone": "telefone do cliente (qualquer formato de telefone encontrado)",
  "insurer": "nome da seguradora/empresa (procure por 'seguradora', 'cia', 'company')",
  "issue_date": "data de início da vigência (formato DD/MM/YYYY)",
  "expiry_date": "data final da vigência (formato DD/MM/YYYY)",
  "coverage_amount": "valor da cobertura (apenas números, sem símbolos)",
  "premium": "valor do prêmio (apenas números, sem símbolos)",
  "type": "tipo do seguro (AUTOMÓVEL, VIDA, RESIDENCIAL, etc.)"
}

INSTRUÇÕES CRÍTICAS:
- Leia ATENTAMENTE todo o texto fornecido acima
- Se não encontrar uma informação específica, use string vazia ""
- Para datas, procure padrões como "vigência", "válido de", "período"
- Para valores, procure "R$", "valor", "importância segurada", "prêmio"
- NÃO MODIFIQUE os dados encontrados - use exatamente como estão
- NÃO USE dados fictícios como "João Silva", "AP123456", etc.
- Retorne APENAS o objeto JSON, sem comentários`
            }
          ],
          temperature: 0.0, // Máxima precisão
          max_tokens: 1500,
          top_p: 0.1 // Máxima determinismo
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro na API da OpenAI:', error);
        throw new Error(`Erro na API da OpenAI: ${error.error?.message || 'Erro desconhecido'}`);
      }

      const result = await response.json();
      console.log('Resposta completa da OpenAI:', result);
      
      // Parse the JSON from the API response
      const responseContent = result.choices[0].message.content;
      console.log('Conteúdo bruto da resposta:', responseContent);
      
      let extractedData;
      try {
        // Use the helper function to extract JSON from the response
        extractedData = extractJsonFromLLMResponse(responseContent);
        console.log('Dados extraídos do JSON:', extractedData);
      } catch (parseError) {
        console.error('Erro ao analisar resposta JSON:', parseError);
        console.log('Resposta que causou erro:', responseContent);
        throw new Error('A resposta da OpenAI não está em formato JSON válido');
      }
      
      // Validar se temos dados reais extraídos (não fictícios)
      const hasSuspiciousData = 
        extractedData.policy_number === 'AP123456' ||
        extractedData.customer_name === 'João Silva' ||
        extractedData.customer_phone === '(11) 98765-4321' ||
        extractedData.insurer === 'Seguradora Brasil';
        
      if (hasSuspiciousData) {
        throw new Error('A IA retornou dados fictícios em vez dos dados reais do documento. Verifique se o PDF contém texto legível.');
      }
      
      const hasRealData = extractedData.policy_number || extractedData.customer_name || extractedData.insurer;
      if (!hasRealData) {
        throw new Error('Não foi possível extrair dados reais do documento. Verifique se o PDF contém informações de apólice legíveis.');
      }
      
      // Convert date strings to Date objects, preserving the original Brazilian format
      const formatBrazilianDate = (dateStr: string) => {
        if (!dateStr || dateStr.trim() === '') return new Date();
        
        // Remove espaços e caracteres especiais
        const cleanDate = dateStr.trim();
        
        // Check if date is in Brazilian format (DD/MM/YYYY)
        const parts = cleanDate.split('/');
        if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
          // Convert DD/MM/YYYY to YYYY-MM-DD for ISO format
          const day = parts[0].trim().padStart(2, '0');
          const month = parts[1].trim().padStart(2, '0');
          const year = parts[2].trim();
          
          // Validar se a data é válida
          const date = new Date(`${year}-${month}-${day}T00:00:00`);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
        
        // Se não conseguir interpretar, retornar data padrão
        console.warn('Data não pôde ser interpretada:', dateStr);
        return new Date();
      };
      
      // Parse numeric values more carefully
      const parseMonetaryValue = (value: any) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          // Remove tudo exceto números, vírgulas e pontos
          const cleaned = value.replace(/[^\d.,]/g, '');
          if (cleaned === '') return 0;
          
          // Se tem vírgula como decimal (formato brasileiro)
          if (cleaned.includes(',') && !cleaned.includes('.')) {
            return parseFloat(cleaned.replace(',', '.'));
          }
          
          // Se tem ponto e vírgula (formato 1.000,00)
          if (cleaned.includes('.') && cleaned.includes(',')) {
            return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
          }
          
          // Se só tem pontos (formato americano ou milhares)
          if (cleaned.includes('.')) {
            const parts = cleaned.split('.');
            if (parts.length === 2 && parts[1].length <= 2) {
              // É decimal (formato americano)
              return parseFloat(cleaned);
            } else {
              // São milhares
              return parseFloat(cleaned.replace(/\./g, ''));
            }
          }
          
          return parseFloat(cleaned) || 0;
        }
        return 0;
      };
      
      // Process the extracted data with better validation
      const processedData: Partial<Policy> = {
        policy_number: extractedData.policy_number?.toString().trim() || '',
        customer_name: extractedData.customer_name?.toString().trim() || '',
        customer_phone: extractedData.customer_phone?.toString().trim() || '',
        insurer: extractedData.insurer?.toString().trim() || '',
        issue_date: formatBrazilianDate(extractedData.issue_date),
        expiry_date: formatBrazilianDate(extractedData.expiry_date),
        coverage_amount: parseMonetaryValue(extractedData.coverage_amount),
        premium: parseMonetaryValue(extractedData.premium),
        type: extractedData.type?.toString().trim().toUpperCase() || ''
      };
      
      // Log final processed data for debugging
      console.log('Dados finais processados:', processedData);
      
      // Validate the processed data and log warnings for missing critical fields
      const criticalFields = ['policy_number', 'insurer'];
      const missingCritical = criticalFields.filter(field => !processedData[field as keyof typeof processedData]);
      
      if (missingCritical.length > 0) {
        console.warn(`Campos críticos não encontrados: ${missingCritical.join(', ')}`);
        throw new Error(`Não foi possível extrair informações essenciais do documento: ${missingCritical.join(', ')}. Verifique se o documento é uma apólice válida.`);
      }
      
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
