
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Obter variáveis de ambiente
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Este Deno Serve cria um endpoint HTTP para executar a função edge
Deno.serve(async (req) => {
  try {
    // Verificar se a requisição é autorizada (com chave secreta ou outra autenticação)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.split(' ')[1]
    const expectedToken = Deno.env.get('FUNCTION_SECRET')
    
    if (token !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
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
          const formattedDate = expiryDate.toLocaleDateString('pt-BR')
          
          // Calcular dias restantes até o vencimento
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          // Criar notificação para o usuário
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

          results.notifications++
          results.details.push({
            policy_id: policy.id,
            notification_id: notification.id,
            status: 'success'
          })
          
          // Marcar a apólice como notificada para evitar notificações duplicadas
          const { error: updateError } = await supabase
            .from('insurance_policies')
            .update({ 
              reminder_sent: true
            })
            .eq('id', policy.id)

          if (updateError) {
            console.error(`Erro ao atualizar status da apólice ${policy.id}:`, updateError)
          }
          
        } catch (err) {
          console.error(`Erro ao processar apólice ${policy.id}:`, err)
          results.errors++
          results.details.push({
            policy_id: policy.id,
            status: 'error',
            error: err.message
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
        headers: { 'Content-Type': 'application/json' }
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
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
