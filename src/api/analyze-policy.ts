
import { Policy } from '@/types';
import axios from 'axios';
import * as pdfjs from 'pdfjs-dist';

// Configurar o worker do PDF.js
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extrai o texto de um arquivo PDF a partir de sua URL
 */
async function extractTextFromPdf(pdfUrl: string): Promise<string> {
  try {
    console.log('Extraindo texto do PDF:', pdfUrl);
    
    // Para URLs de exemplo, retornamos um texto simulado (mantido apenas para casos de teste)
    if (pdfUrl.includes('example.com')) {
      console.log('URL de exemplo detectada, retornando texto simulado');
      return `
        APÓLICE DE SEGURO AUTO
        NÚMERO: AP177814
        
        SEGURADO: João Silva Santos
        TELEFONE: (11) 98765-4321
        
        VIGÊNCIA: 15/03/2025 a 15/03/2026
        
        SEGURADORA: Seguradora Confiança
        
        VEÍCULO: Honda Civic 2023 - Placa ABC1234
        
        VALOR SEGURADO: R$ 187.950,00
        PRÊMIO TOTAL: R$ 2.876,42
        
        TIPO DE SEGURO: Automóvel
        COBERTURAS:
        - Colisão, incêndio e roubo
        - Danos materiais a terceiros
        - Danos corporais a terceiros
        - Assistência 24h
      `;
    }
    
    // Download e processamento do PDF
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfData = new Uint8Array(response.data);
    
    // Carregar o documento PDF
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extrair texto de todas as páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('Texto extraído com sucesso');
    return fullText;
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Falha ao extrair texto do PDF');
  }
}

/**
 * Analisa o documento de apólice utilizando GPT-4
 */
export async function analyzePolicyDocument(fileUrl: string): Promise<Partial<Policy>> {
  console.log('Analisando documento de apólice:', fileUrl);
  
  try {
    // Extrair texto do PDF
    const pdfText = await extractTextFromPdf(fileUrl);
    
    // Instrução para o GPT-4
    const prompt = `
      Analise este texto extraído de um PDF de apólice de seguro e extraia os seguintes dados:
      1. Número da apólice (identificador único da apólice)
      2. Nome do cliente/segurado
      3. Telefone do cliente (se disponível)
      4. Data de emissão (se disponível, senão use a data inicial de vigência)
      5. Data de vencimento/expiração (data final de vigência)
      6. Nome da seguradora
      7. Valor da cobertura (valor segurado)
      8. Valor do prêmio (quanto o cliente pagou)
      9. Tipo de seguro (auto, residencial, vida, etc.)
      
      É importante identificar corretamente:
      - O NOME COMPLETO do cliente/segurado
      - As DATAS DE VIGÊNCIA (início e fim)
      - O VALOR DA COBERTURA e o VALOR DO PRÊMIO com precisão
      
      Retorne apenas os dados extraídos em formato JSON, com as seguintes chaves:
      policy_number, customer_name, customer_phone, issue_date, expiry_date, insurer, coverage_amount, premium, type.
      
      As datas devem estar no formato YYYY-MM-DD.
      Os valores numéricos de cobertura e prêmio devem ser apenas números sem símbolos de moeda ou formatação.
      Se algum dado não for encontrado, use null para o valor.
      
      Aqui está o texto do documento:
      ${pdfText}
    `;
    
    console.log('Enviando prompt para análise via OpenAI');
    
    // Obter a chave da API do OpenAI via variável de ambiente ou Supabase
    const openaiApiKey = process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('Chave de API do OpenAI não encontrada');
    }
    
    // Chamada real à API do OpenAI (GPT-4)
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em extrair informações de documentos de apólices de seguro.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resposta recebida do OpenAI');
    
    // Extrair a resposta do GPT-4
    const content = openaiResponse.data.choices[0].message.content;
    
    let gptResponse;
    try {
      // Tentar fazer parse do JSON da resposta
      gptResponse = JSON.parse(content);
    } catch (error) {
      console.error('Erro ao parsear resposta do GPT-4:', error);
      
      // Tentar extrair JSON de dentro do texto
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          gptResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (innerError) {
          console.error('Erro ao parsear JSON extraído:', innerError);
          throw new Error('Falha ao processar resposta da IA');
        }
      } else {
        throw new Error('Formato de resposta da IA inválido');
      }
    }
    
    console.log('Dados extraídos pelo GPT-4:', gptResponse);
    
    // Converter datas de string para objetos Date
    const issueDate = gptResponse.issue_date ? new Date(gptResponse.issue_date) : new Date();
    const expiryDate = gptResponse.expiry_date ? new Date(gptResponse.expiry_date) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    
    // Calcular data de lembrete (30 dias antes do vencimento)
    const reminderDate = new Date(expiryDate);
    reminderDate.setDate(reminderDate.getDate() - 30);
    
    return {
      policy_number: gptResponse.policy_number,
      customer_name: gptResponse.customer_name,
      customer_phone: gptResponse.customer_phone || '',
      issue_date: issueDate,
      expiry_date: expiryDate,
      reminder_date: reminderDate,
      insurer: gptResponse.insurer,
      coverage_amount: gptResponse.coverage_amount,
      premium: gptResponse.premium,
      type: gptResponse.type || 'auto',
      notes: 'Informações extraídas automaticamente via IA usando GPT-4'
    };
  } catch (error) {
    console.error('Erro na análise do documento:', error);
    throw error;
  }
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
    
    // Analisar o documento PDF com GPT-4
    const policyData = await analyzePolicyDocument(fileUrl);
    
    return res.status(200).json({
      success: true,
      data: policyData
    });
  } catch (error) {
    console.error('Erro ao analisar documento:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao analisar o documento: ' + (error.message || 'Erro desconhecido')
    });
  }
}
