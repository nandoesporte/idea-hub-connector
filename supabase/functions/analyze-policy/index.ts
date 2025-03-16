
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

interface RequestPayload {
  pdfBase64: string
  fileName: string
}

interface PolicyData {
  policyNumber: string
  customerName: string
  issueDate: string
  expiryDate: string
  insurer: string
  coverageAmount: string
  premium: string
  type: string
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!
    )

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { pdfBase64, fileName } = await req.json() as RequestPayload

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'No PDF data provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Call OpenAI API (GPT-4 Vision) to analyze the PDF
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em extrair informações de apólices de seguro.
                     Analise a apólice no PDF fornecido e extraia as seguintes informações:
                     - Número da apólice
                     - Nome do cliente/segurado
                     - Data de emissão
                     - Data de vencimento/expiração
                     - Nome da seguradora
                     - Valor da cobertura
                     - Valor do prêmio
                     - Tipo de seguro (auto, vida, residencial, empresarial, etc.)
                     
                     Forneça a resposta em formato JSON estruturado com os campos:
                     policyNumber, customerName, issueDate (YYYY-MM-DD), expiryDate (YYYY-MM-DD), 
                     insurer, coverageAmount, premium, type
                     
                     Se alguma informação não estiver disponível, faça sua melhor estimativa com base no contexto.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise esta apólice de seguro. O nome do arquivo é: ${fileName}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 800,
      }),
    });

    const openAIData = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', openAIData);
      return new Response(
        JSON.stringify({ error: 'Error communicating with OpenAI' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract the JSON from the response
    const assistantMessageContent = openAIData.choices[0].message.content;
    let extractedData: PolicyData;
    
    try {
      // Find the JSON object in the text response
      const jsonMatch = assistantMessageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing JSON from OpenAI response:', error);
      console.log('Response content:', assistantMessageContent);
      
      // Fallback to a more basic extraction approach
      extractedData = {
        policyNumber: extractValueByKey(assistantMessageContent, 'policyNumber') || `AP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        customerName: extractValueByKey(assistantMessageContent, 'customerName') || 'Cliente não identificado',
        issueDate: extractValueByKey(assistantMessageContent, 'issueDate') || new Date().toISOString().split('T')[0],
        expiryDate: extractValueByKey(assistantMessageContent, 'expiryDate') || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        insurer: extractValueByKey(assistantMessageContent, 'insurer') || 'Seguradora não identificada',
        coverageAmount: extractValueByKey(assistantMessageContent, 'coverageAmount') || 'R$ 100.000,00',
        premium: extractValueByKey(assistantMessageContent, 'premium') || 'R$ 1.000,00',
        type: extractValueByKey(assistantMessageContent, 'type') || 'general',
      };
    }

    return new Response(
      JSON.stringify(extractedData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to extract values from the text response as a fallback
function extractValueByKey(text: string, key: string): string | null {
  const regex = new RegExp(`${key}[\\s]*:?[\\s]*(["']?)(.*?)\\1(?:[,\\r\\n}]|$)`, 'i');
  const match = text.match(regex);
  return match ? match[2].trim() : null;
}
