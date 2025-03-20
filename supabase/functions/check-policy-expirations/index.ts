
// @ts-ignore
import { createClient } from '@supabase/supabase-js'
import { format, addDays } from 'date-fns'

// Obter variáveis de ambiente
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Este Deno Serve cria um endpoint HTTP para executar a função edge
Deno.serve(async (req) => {
  try {
    // CORS headers para permitir chamadas de diferentes origens
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    }

    // Verificar e responder a requisições OPTIONS (pré-flight CORS)
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers })
    }

    // Verificar se a requisição é autorizada (com chave secreta ou outra autenticação)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Não autorizado' 
        }),
        { status: 401, headers }
      )
    }

    const token = authHeader.split(' ')[1]
    const expectedToken = Deno.env.get('FUNCTION_SECRET')
    
    if (!expectedToken) {
      console.error('FUNCTION_SECRET não definido nas variáveis de ambiente')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuração do servidor incompleta' 
        }),
        { status: 500, headers }
      )
    }
    
    if (token !== expectedToken) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Token inválido' 
        }),
        { status: 401, headers }
      )
    }

    // Criar cliente Supabase com a role de serviço para acessar todos os dados
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Iniciando verificação de apólices próximas do vencimento...')

    // Obter data atual
    const today = new Date()
    
    // Formatar para log
    const formattedToday = format(today, 'dd/MM/yyyy')
    console.log(`Data atual: ${formattedToday}`)
    
    // Formatar como ISO string para comparação com o banco de dados
    const todayISO = today.toISOString()

    // Consultar apólices ativas que ainda não tiveram lembrete enviado
    // e cuja data de lembrete (30 dias antes do vencimento) já chegou
    const { data: policies, error: policiesError } = await supabase
      .from('insurance_policies')
      .select(`
        id, 
        user_id, 
        policy_number, 
        customer_name,
        expiry_date,
        insurer,
        type,
        premium,
        reminder_date
      `)
      .eq('status', 'active')
      .eq('reminder_sent', false)
      .lte('reminder_date', todayISO)

    if (policiesError) {
      console.error('Erro ao consultar apólices:', policiesError)
      throw new Error('Falha ao verificar apólices no banco de dados')
    }

    console.log(`Encontradas ${policies?.length || 0} apólices com lembretes pendentes`)

    // Registrar atividade
    const results = {
      processed: 0,
      notifications: 0,
      errors: 0,
      details: []
    }

    // Processar as apólices encontradas
    if (policies && policies.length > 0) {
      for (const policy of policies) {
        try {
          results.processed++
          
          // Formatar data de vencimento para exibição
          const expiryDate = new Date(policy.expiry_date)
          const formattedDate = format(expiryDate, 'dd/MM/yyyy')
          
          // Calcular dias restantes até o vencimento de forma mais precisa
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          console.log(`Processando apólice ${policy.policy_number}, vencimento em ${daysUntilExpiry} dias (${formattedDate})`)
          
          // Verificar se o usuário existe antes de criar a notificação
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', policy.user_id)
            .single()
            
          if (userError) {
            console.warn(`Usuário ${policy.user_id} não encontrado, pulando notificação`)
            continue
          }
          
          // Criar notificação para o usuário com detalhes mais precisos da apólice
          const { data: notification, error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: policy.user_id,
              title: 'Apólice próxima do vencimento',
              message: `A apólice ${policy.policy_number} da ${policy.insurer} vence em ${daysUntilExpiry} dias (${formattedDate}).`,
              type: 'warning',
              is_read: false,
              related_entity_type: 'policy',
              related_entity_id: policy.id
            })
            .select()
            .single()

          if (notificationError) {
            throw new Error(`Falha ao criar notificação: ${notificationError.message}`)
          }

          console.log(`Notificação criada com ID: ${notification.id}`)
          
          results.notifications++
          results.details.push({
            policy_id: policy.id,
            notification_id: notification.id,
            status: 'success',
            policy_number: policy.policy_number,
            customer_name: policy.customer_name,
            days_until_expiry: daysUntilExpiry,
            expiry_date: formattedDate
          })
          
          // Marcar a apólice como notificada para evitar notificações duplicadas
          const { error: updateError } = await supabase
            .from('insurance_policies')
            .update({ 
              reminder_sent: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', policy.id)

          if (updateError) {
            console.error(`Erro ao atualizar status da apólice ${policy.id}:`, updateError)
            throw new Error(`Falha ao atualizar status da apólice: ${updateError.message}`)
          }
          
          console.log(`Apólice ${policy.policy_number} marcada como notificada`)
          
        } catch (err) {
          console.error(`Erro ao processar apólice ${policy.id}:`, err)
          results.errors++
          results.details.push({
            policy_id: policy.id,
            status: 'error',
            error: err.message,
            policy_number: policy.policy_number || 'Desconhecido'
          })
        }
      }
    }

    // Retornar resultados
    return new Response(
      JSON.stringify({
        success: true,
        message: `Verificação concluída. Processadas: ${results.processed}, Notificações criadas: ${results.notifications}, Erros: ${results.errors}`,
        results
      }),
      { 
        status: 200,
        headers
      }
    )

  } catch (error) {
    console.error('Erro na função edge:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno na função edge'
      }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
