
// This is a client-side proxy to handle WhatsApp API requests with proper CORS handling
// For production, this should be implemented on your server

interface ProxyRequestBody {
  target_url: string;
  method?: string;
  api_key: string;
  body?: any;
}

interface ProxyResponse {
  status: number;
  data: any;
  error?: string;
}

/**
 * Proxy for WhatsApp API requests that handles CORS issues
 * For production use, implement this logic on your backend
 */
export async function proxyWhatsAppRequest(requestData: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { target_url, method, api_key, body } = requestData;

    if (!target_url || !api_key) {
      throw new Error('Missing required parameters: target_url and api_key must be provided');
    }

    // Check for local development and provide warning
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('.lovableproject.com')) {
      console.warn('⚠️ Using WhatsGW API from development environment. CORS errors are expected unless:');
      console.warn('1. You\'ve registered this domain in your WhatsGW dashboard');
      console.warn('2. Or you\'re using a CORS proxy for testing (not recommended for production)');
    }

    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': api_key,
        'Accept': 'application/json'
      },
      // Enable credentials if needed
      credentials: 'omit', // Change to 'include' if API requires cookies
      mode: 'cors',
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Log the request for debugging
    console.log(`Making request to ${target_url} with method ${fetchOptions.method}`);

    // Make the actual API call
    const response = await fetch(target_url, fetchOptions);
    
    // Handle different response types
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // Handle text or other response types
      const text = await response.text();
      responseData = { message: text };
    }
    
    // If response indicates domain authorization issue, provide specific guidance
    if (response.status === 403) {
      console.error('WhatsGW API access denied (403)');
      console.info('📌 To fix this issue:');
      console.info('1. Log in to your WhatsGW dashboard');
      console.info('2. Go to Settings > API Access');
      console.info('3. Add your domain to the authorized domains list');
      console.info('4. Or use the WhatsGW API through your backend server');
      console.info('Documentation: https://documenter.getpostman.com/view/3741041/SztBa7ku');
      
      return {
        status: 403,
        data: responseData,
        error: 'Acesso negado (403). Você precisa autorizar este domínio no painel da WhatsGW ou sua chave de API pode estar incorreta.'
      };
    }
    
    return {
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error('WhatsApp proxy error:', error);
    
    // Check for network errors which might indicate CORS issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.info('📌 This may be a CORS issue. If testing locally:');
      console.info('1. Ensure your WhatsGW account allows this domain');
      console.info('2. Consider implementing this request on your backend');
      
      return {
        status: 0,
        data: null,
        error: 'Erro de conectividade: Possível problema de CORS. Verifique se o domínio está autorizado no painel da WhatsGW.'
      };
    }
    
    return {
      status: 500,
      data: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
