
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
    if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('Ambiente de desenvolvimento - simulando verificação de apólices');
      return res.status(200).json({
        success: true,
        message: 'Verificação de apólices simulada com sucesso',
        data: {
          processed: 0,
          notifications: 0,
          errors: 0
        }
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
