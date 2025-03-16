
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

// List of available CORS proxies to try
const CORS_PROXIES = [
  // First, try without proxy (direct connection)
  '',
  // Then try these public CORS proxies
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

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

    // Try each proxy until one works
    let lastError: any = null;
    
    for (const proxy of CORS_PROXIES) {
      try {
        // If using a proxy that requires URL encoding
        const fullUrl = proxy ? 
          (proxy.includes('allorigins') ? proxy + encodeURIComponent(target_url) : proxy + target_url) : 
          target_url;
        
        console.log(`Attempting connection via: ${proxy ? proxy + '...' : 'direct connection'}`);
        
        // Make the actual API call
        const response = await fetch(fullUrl, fetchOptions);
        
        // Handle different response types
        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          // Handle text or other response types
          const text = await response.text();
          
          // Try to parse it as JSON anyway (some APIs return JSON with wrong content type)
          try {
            responseData = JSON.parse(text);
          } catch {
            responseData = { message: text };
          }
        }
        
        // If we got a 403 error but we're using a proxy, it might be the proxy that's rejecting the request
        if (response.status === 403 && proxy) {
          console.warn(`CORS proxy ${proxy} returned 403 - trying next option`);
          lastError = {
            status: 403,
            data: responseData,
            error: `Proxy ${proxy} retornou 403. Tentando próxima opção...`
          };
          continue; // Try the next proxy
        }
        
        // If response indicates domain authorization issue from WhatsGW API itself
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
        
        // If we got here, we've successfully made a request
        console.log(`Successfully connected via: ${proxy ? proxy : 'direct connection'}`);
        
        return {
          status: response.status,
          data: responseData
        };
      } catch (error) {
        // Save the error and try the next proxy
        console.warn(`Failed with proxy ${proxy}:`, error);
        lastError = error;
      }
    }
    
    // If we got here, all proxies failed
    console.error('All connection methods failed:', lastError);
    
    // Check for network errors which might indicate CORS issues
    if (lastError instanceof TypeError && lastError.message.includes('Failed to fetch')) {
      console.info('📌 This may be a CORS issue. If testing locally:');
      console.info('1. Ensure your WhatsGW account allows this domain');
      console.info('2. Consider implementing this request on your backend');
      
      return {
        status: 0,
        data: null,
        error: 'Erro de conectividade: Possível problema de CORS. Tentamos várias opções de conexão sem sucesso.'
      };
    }
    
    return {
      status: 500,
      data: null,
      error: lastError instanceof Error ? lastError.message : String(lastError)
    };
  } catch (error) {
    console.error('WhatsApp proxy error:', error);
    
    return {
      status: 500,
      data: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
