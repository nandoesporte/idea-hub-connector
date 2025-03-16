
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

interface RequestBody {
  url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json() as RequestBody;

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL do documento é obrigatório' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch PDF content
    const pdfResponse = await fetch(url);
    if (!pdfResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Erro ao baixar o PDF da apólice' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(
      new Uint8Array(pdfBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Analyze PDF with GPT-4 Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em analisar documentos de apólices de seguro. Extraia as informações relevantes do PDF da apólice e forneça-as em um formato JSON estruturado. Seja preciso e extraia o máximo de informações possível.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise esta apólice de seguro e extraia as seguintes informações: número da apólice, nome do segurado, telefone do segurado (se disponível), data de emissão, data de vencimento, nome da seguradora, valor de cobertura, valor do prêmio e tipo de seguro. Forneça os resultados em um formato JSON com as seguintes chaves: policyNumber, customerName, customerPhone, issueDate (formato ISO), expiryDate (formato ISO), insurer, coverageAmount (número), premium (número), type.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro na análise do documento' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    let extractedData;

    try {
      // Try to parse the JSON from the GPT-4 response
      const content = data.choices[0].message.content;
      // Find JSON object in the response if it's not pure JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in the response');
      }
    } catch (error) {
      console.error('Error parsing GPT-4 response:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar a resposta do analisador' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return the extracted data
    return new Response(
      JSON.stringify(extractedData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
