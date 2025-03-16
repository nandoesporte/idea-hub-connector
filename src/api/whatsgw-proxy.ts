
// This is a simple client-side proxy to handle WhatsApp API requests
// In a real application, this would be deployed on your server

interface ProxyRequestBody {
  target_url: string;
  method?: string;
  api_key: string;
  body?: any;
}

export async function proxyWhatsAppRequest(requestData: ProxyRequestBody) {
  try {
    const { target_url, method, api_key, body } = requestData;

    if (!target_url || !api_key) {
      throw new Error('Missing required parameters');
    }

    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': api_key,
        'Accept': 'application/json'
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Make the actual API call
    const response = await fetch(target_url, fetchOptions);
    
    // Get the response from the WhatsApp API
    const responseData = await response.json();
    
    return {
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error('WhatsApp proxy error:', error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
