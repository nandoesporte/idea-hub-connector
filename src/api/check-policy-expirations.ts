
/**
 * API endpoint para verificar apólices próximas do vencimento e enviar notificações
 */

import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }
    
    // No ambiente de desenvolvimento, simular o sucesso
    if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE ===  'true') {
      console.log('Ambiente de desenvolvimento - simulando verificação de apólices');
      
      // Mesmo em desenvolvimento, vamos verificar as apólices localmente
      const userId = session.user.id;
      const today = new Date();
      const todayISO = today.toISOString();
      
      // Buscar apólices que precisam de lembretes
      const { data: policies, error: policiesError } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('reminder_sent', false)
        .lte('reminder_date', todayISO);
        
      if (policiesError) {
        console.error('Erro ao verificar apólices:', policiesError);
        if (policiesError.code === '42P01') {
          // Tabela não existe
          return res.status(200).json({
            success: true,
            message: 'Verificação simulada - tabela não existe ainda',
            data: {
              processed: 0,
              notifications: 0,
              errors: 0
            }
          });
        }
      }
      
      const results = {
        processed: 0,
        notifications: 0,
        errors: 0
      };
      
      // Se encontrou apólices, criar notificações
      if (policies && policies.length > 0) {
        results.processed = policies.length;
        
        for (const policy of policies) {
          try {
            // Criar notificação
            const { data: notification, error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: userId,
                title: 'Apólice próxima do vencimento',
                message: `A apólice ${policy.policy_number} da ${policy.insurer} vence em breve (${new Date(policy.expiry_date).toLocaleDateString()}).`,
                type: 'warning',
                is_read: false,
                related_entity_type: 'policy',
                related_entity_id: policy.id
              });
              
            if (notifError) {
              console.error('Erro ao criar notificação:', notifError);
              results.errors++;
            } else {
              results.notifications++;
              
              // Marcar apólice como notificada
              await supabase
                .from('insurance_policies')
                .update({ reminder_sent: true })
                .eq('id', policy.id);
            }
          } catch (err) {
            console.error('Erro ao processar apólice:', err);
            results.errors++;
          }
        }
      }
      
      return res.status(200).json({
        success: true,
        message: `Verificação de apólices simulada com sucesso: ${results.notifications} notificações enviadas`,
        data: results
      });
    }
    
    // Em produção, chamar a função edge
    const supabaseUrl = 'https://otzytxkynqcywtqgpgmn.supabase.co';
    if (!supabaseUrl) {
      throw new Error('URL do Supabase não configurada');
    }
    
    const functionUrl = `${supabaseUrl}/functions/v1/check-policy-expirations`;
    const functionSecret = import.meta.env.VITE_FUNCTION_SECRET;
    
    if (!functionSecret) {
      throw new Error('Segredo da função edge não configurado. Defina VITE_FUNCTION_SECRET nas variáveis de ambiente.');
    }
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${functionSecret}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao chamar função edge: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.results
    });
  } catch (error) {
    console.error('Erro ao verificar apólices:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao verificar apólices'
    });
  }
}
