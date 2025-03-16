
import { Request, Response } from 'express';

// This is a simple server-side proxy to handle WhatsApp API requests
// In a real application, this would be deployed on your server
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { target_url, method, api_key, body } = req.body;

    if (!target_url || !api_key) {
      return res.status(400).json({ error: 'Missing required parameters' });
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

    // Make the actual API call from the server
    const response = await fetch(target_url, fetchOptions);
    
    // Forward the response from the WhatsApp API
    const responseData = await response.json();
    
    return res.status(response.status).json(responseData);
  } catch (error) {
    console.error('WhatsApp proxy error:', error);
    return res.status(500).json({ 
      error: 'Error proxying request to WhatsApp API',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
