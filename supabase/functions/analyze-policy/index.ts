
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
  console.log('Analyze Policy Edge Function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Add combined headers for all responses
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
    };

    // Check if the API keys are available
    if (!openaiApiKey) {
      console.error('OpenAI API key is not set');
      return new Response(
        JSON.stringify({ error: 'Configuração de API ausente. Contate o administrador.' }),
        { status: 500, headers: responseHeaders }
      );
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials are not set:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      });
      return new Response(
        JSON.stringify({ error: 'Configuração de Supabase ausente. Contate o administrador.' }),
        { status: 500, headers: responseHeaders }
      );
    }

    // Parse the request body
    let body: RequestBody;
    try {
      body = await req.json() as RequestBody;
      console.log('Request body parsed successfully:', { url: body.url?.substring(0, 50) + '...' });
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Formato de requisição inválido', details: String(error) }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Validate the URL
    if (!body.url) {
      console.error('URL is missing in the request');
      return new Response(
        JSON.stringify({ error: 'URL do documento é obrigatório' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Create Supabase client
    console.log('Creating Supabase client with URL:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch PDF content
    console.log(`Attempting to fetch document from URL: ${body.url}`);
    let pdfResponse;
    try {
      pdfResponse = await fetch(body.url);
    } catch (fetchError) {
      console.error('Network error fetching document:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro de rede ao buscar o documento', 
          details: String(fetchError) 
        }),
        { status: 500, headers: responseHeaders }
      );
    }
    
    if (!pdfResponse.ok) {
      console.error(`Error downloading document: ${pdfResponse.status} ${pdfResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: `Erro ao baixar o documento: ${pdfResponse.statusText}`,
          status: pdfResponse.status 
        }),
        { status: 500, headers: responseHeaders }
      );
    }

    // Convert to base64
    try {
      console.log('Converting document to base64');
      const pdfBuffer = await pdfResponse.arrayBuffer();
      console.log(`Document size: ${pdfBuffer.byteLength} bytes`);
      
      if (pdfBuffer.byteLength === 0) {
        console.error('Document is empty (0 bytes)');
        return new Response(
          JSON.stringify({ error: 'O documento baixado está vazio' }),
          { status: 500, headers: responseHeaders }
        );
      }
      
      const pdfBase64 = btoa(
        new Uint8Array(pdfBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      console.log('Document successfully converted to base64');
      console.log(`Base64 length: ${pdfBase64.length} characters`);

      // Analyze PDF with GPT-4 Vision
      console.log('Preparing request to OpenAI for analysis');
      const openaiRequestBody = {
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
      };
      
      console.log('Sending request to OpenAI API');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openaiRequestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        return new Response(
          JSON.stringify({ 
            error: 'Erro na análise do documento', 
            details: errorData,
            status: response.status,
            statusText: response.statusText
          }),
          { status: 500, headers: responseHeaders }
        );
      }

      const data = await response.json();
      console.log('Received response from OpenAI');
      
      let extractedData;
      try {
        // Try to parse the JSON from the GPT-4 response
        const content = data.choices[0].message.content;
        console.log('GPT-4 response content:', content);
        
        // Find JSON object in the response if it's not pure JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed JSON from response:', extractedData);
        } else {
          throw new Error('No JSON found in the response');
        }
      } catch (error) {
        console.error('Error parsing GPT-4 response:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao processar a resposta do analisador',
            rawContent: data.choices[0].message.content,
            details: String(error)
          }),
          { status: 500, headers: responseHeaders }
        );
      }

      // Return the extracted data
      console.log('Returning extracted data to client');
      return new Response(
        JSON.stringify(extractedData),
        { status: 200, headers: responseHeaders }
      );
    } catch (error) {
      console.error('Error processing PDF document:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar o documento PDF', details: String(error) }),
        { status: 500, headers: responseHeaders }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
