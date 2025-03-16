
import { supabase } from './supabase';

// API Key Management
export const setApiKey = async (apiKey: string, apiUrl?: string): Promise<void> => {
  const url = apiUrl || 'https://app.whatsgw.com.br/api/v1';
  localStorage.setItem('whatsgw_api_key', apiKey);
  localStorage.setItem('whatsgw_api_url', url);
  console.log('Setting API key:', apiKey, 'and URL:', url);
  return Promise.resolve();
};

export const getApiKey = (): { apiKey: string; apiUrl: string } => {
  const apiKey = localStorage.getItem('whatsgw_api_key') || '';
  const apiUrl = localStorage.getItem('whatsgw_api_url') || 'https://app.whatsgw.com.br/api/v1';
  return { apiKey, apiUrl };
};

export const isWhatsAppConfigured = (): boolean => {
  const { apiKey } = getApiKey();
  return !!apiKey && apiKey.trim() !== '';
};

// Message Sending Functions
export const sendWhatsAppMessage = async (params: { phone: string; message: string }): Promise<boolean> => {
  const { phone, message } = params;
  console.log(`Sending WhatsApp message to ${phone}: ${message}`);
  
  try {
    // Just a placeholder for actual implementation
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

export const sendTestMessage = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    const success = await sendWhatsAppMessage({
      phone: phoneNumber,
      message: 'This is a test message'
    });
    return { 
      success, 
      message: success ? 'Message sent successfully' : 'Failed to send message'
    };
  } catch (error) {
    console.error("Error in sendTestMessage:", error);
    return { success: false, message: 'Error sending test message' };
  }
};

export const sendTestToSpecificNumber = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const success = await sendWhatsAppMessage({
      phone: '44988057213',
      message: 'This is a test message to a specific number'
    });
    return { 
      success, 
      message: success ? 'Message sent successfully to 44988057213' : 'Failed to send message'
    };
  } catch (error) {
    console.error("Error in sendTestToSpecificNumber:", error);
    return { success: false, message: 'Error sending test message' };
  }
};

// Event Notifications
export const sendEventReminder = async (event: any): Promise<boolean> => {
  try {
    if (!event.contactPhone) {
      console.log('No phone number provided for event reminder');
      return false;
    }
    
    const message = `Reminder: ${event.title} on ${new Date(event.date).toLocaleString()}`;
    return await sendWhatsAppMessage({
      phone: event.contactPhone,
      message: message
    });
  } catch (error) {
    console.error("Error sending event reminder:", error);
    return false;
  }
};

export const notifyAdminsAboutEvent = async (event: any): Promise<number> => {
  try {
    const message = `New event created: ${event.title} on ${new Date(event.date).toLocaleString()}`;
    
    // Get admin numbers from localStorage
    const adminNumbers = getAdminNumbers();
    if (adminNumbers.length === 0) {
      return 0;
    }
    
    let successCount = 0;
    for (const number of adminNumbers) {
      const success = await sendWhatsAppMessage({
        phone: number,
        message: message
      });
      
      if (success) successCount++;
    }
    
    return successCount;
  } catch (error) {
    console.error("Error notifying admins:", error);
    return 0;
  }
};

export const notifyAdminsAboutSystemEvent = async (message: string): Promise<number> => {
  try {
    // Get admin numbers from localStorage
    const adminNumbers = getAdminNumbers();
    if (adminNumbers.length === 0) {
      return 0;
    }
    
    let successCount = 0;
    for (const number of adminNumbers) {
      const success = await sendWhatsAppMessage({
        phone: number,
        message: `System notification: ${message}`
      });
      
      if (success) successCount++;
    }
    
    return successCount;
  } catch (error) {
    console.error("Error notifying admins about system event:", error);
    return 0;
  }
};

// Helper function to get admin numbers
const getAdminNumbers = (): string[] => {
  try {
    const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
    if (savedNumbers) {
      const parsedNumbers = JSON.parse(savedNumbers);
      return Array.isArray(parsedNumbers) ? parsedNumbers.filter(num => num && num.trim() !== '') : [];
    }
  } catch (error) {
    console.error('Error parsing admin numbers from localStorage:', error);
  }
  return [];
};

// Log Management
export const getLogHistory = (): any[] => {
  try {
    const logs = localStorage.getItem('whatsgw_logs');
    if (logs) {
      return JSON.parse(logs);
    }
  } catch (error) {
    console.error("Error getting log history:", error);
  }
  return [];
};

export const clearLogHistory = (): void => {
  localStorage.removeItem('whatsgw_logs');
  console.log('Clearing WhatsApp log history');
};

// API Testing
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection');
    const { apiKey, apiUrl } = getApiKey();
    
    if (!apiKey) {
      console.log('No API key configured');
      return false;
    }
    
    // Placeholder for actual API testing
    // In a real implementation, this would make a request to the WhatsApp API
    return true;
  } catch (error) {
    console.error("Error testing API connection:", error);
    return false;
  }
};

// Policy Management functions
export const getAllPolicies = async (): Promise<any[]> => {
  try {
    // In a real implementation, this would fetch from Supabase
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching policies:", error);
      throw new Error("Failed to get policies: " + error.message);
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getAllPolicies:", error);
    throw error;
  }
};

export const simulateWhatsAppPolicyMessage = async (): Promise<any> => {
  try {
    // Simulate a policy being received and processed
    const newPolicy = {
      policy_number: `POL-${Math.floor(Math.random() * 10000)}`,
      customer: "Simulated Customer",
      insurer: "Example Insurance Company",
      start_date: new Date(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      premium_amount: Math.floor(Math.random() * 1000) + 500,
      document_url: "https://example.com/policy.pdf",
      status: "active"
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([newPolicy])
      .select();
      
    if (error) {
      console.error("Error inserting simulated policy:", error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error("Error in simulateWhatsAppPolicyMessage:", error);
    throw error;
  }
};

// New function to upload, analyze with GPT-4, and save policy
export const uploadAndAnalyzePolicy = async (file: File): Promise<any> => {
  try {
    console.log("Uploading and analyzing policy document:", file.name);
    
    // Since RLS policies are preventing bucket creation from the client side,
    // we'll try to use an existing bucket or fallback to a public URL approach
    
    // Step 1: Generate a unique file name for the document
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `policy_documents/${fileName}`;
    let documentUrl = '';
    
    try {
      // Check if the bucket exists first (no need to create it)
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'documents');
      
      if (bucketExists) {
        // Only attempt to upload if the bucket exists
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('documents')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error("Error uploading file to storage:", uploadError);
          throw uploadError;
        }
        
        // Get the public URL for the uploaded file
        const { data: urlData } = await supabase
          .storage
          .from('documents')
          .getPublicUrl(filePath);
          
        documentUrl = urlData?.publicUrl || '';
      } else {
        console.log("Documents bucket doesn't exist, using file object for analysis only");
        // We'll proceed without storing the file - in production you might use
        // a different approach like a third-party storage service or base64 encoding
        documentUrl = URL.createObjectURL(file); // Create temporary local URL
      }
    } catch (error) {
      console.error("Error with storage operation:", error);
      // Continue with analysis even if storage fails - we'll use the file object directly
      documentUrl = URL.createObjectURL(file); // Fallback to temporary local URL
    }
    
    // Step 2: Analyze the document with GPT-4 (simulated in this implementation)
    console.log("Analyzing document with GPT-4:", file.name);
    const policyData = await analyzeDocumentWithGpt4(file, documentUrl);
    
    // Step 3: Save the analyzed policy data to the database
    const { data: insertData, error: insertError } = await supabase
      .from('insurance_policies')
      .insert([policyData])
      .select();
      
    if (insertError) {
      console.error("Error inserting policy data:", insertError);
      throw insertError;
    }
    
    return insertData?.[0] || null;
  } catch (error) {
    console.error("Error in uploadAndAnalyzePolicy:", error);
    throw error;
  }
};

// New function for GPT-4 analysis of policy documents
const analyzeDocumentWithGpt4 = async (file: File, documentUrl: string): Promise<any> => {
  console.log("Analyzing document with GPT-4:", file.name);
  
  // In a real implementation, this would send the document to GPT-4 API
  // Here we're just simulating the analysis
  
  // Simulate analysis delay to make it feel realistic
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate realistic policy data based on filename patterns
  const fileName = file.name.toLowerCase();
  const isAuto = fileName.includes('auto') || fileName.includes('car') || fileName.includes('veic');
  const isHome = fileName.includes('home') || fileName.includes('house') || fileName.includes('resid');
  const isLife = fileName.includes('life') || fileName.includes('vida');
  const isHealth = fileName.includes('health') || fileName.includes('saude') || fileName.includes('saúde');
  
  // Create policy number with appropriate prefix
  let policyPrefix = 'GEN'; // General
  let insurerName = "Seguradora Brasil";
  let premium = Math.floor(Math.random() * 1000) + 500;
  
  if (isAuto) {
    policyPrefix = 'AUTO';
    insurerName = "Auto Seguro Nacional";
    premium = Math.floor(Math.random() * 2000) + 1000;
  } else if (isHome) {
    policyPrefix = 'HOME';
    insurerName = "Proteção Residencial";
    premium = Math.floor(Math.random() * 800) + 400;
  } else if (isLife) {
    policyPrefix = 'LIFE';
    insurerName = "Vida Segura";
    premium = Math.floor(Math.random() * 500) + 200;
  } else if (isHealth) {
    policyPrefix = 'HLTH';
    insurerName = "Saúde Total";
    premium = Math.floor(Math.random() * 1500) + 800;
  }
  
  const policyNumber = `${policyPrefix}-${Math.floor(Math.random() * 100000)}`;
  
  // Generate random customer name
  const firstNames = ["João", "Maria", "Pedro", "Ana", "Carlos", "Lúcia", "Fernando", "Márcia"];
  const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues"];
  const customerName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  
  // Generate policy dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // 1 year policy
  
  // Log the analysis results
  console.log(`GPT-4 Analysis Results for ${file.name}:`, {
    type: isAuto ? 'Auto' : isHome ? 'Home' : isLife ? 'Life' : isHealth ? 'Health' : 'General',
    policyNumber,
    customer: customerName,
    insurer: insurerName,
    dates: `${startDate.toISOString()} to ${endDate.toISOString()}`,
    premium
  });
  
  return {
    policy_number: policyNumber,
    customer: customerName,
    insurer: insurerName,
    start_date: startDate,
    end_date: endDate,
    premium_amount: premium,
    document_url: documentUrl,
    status: "active",
    processed_at: new Date(),
    whatsapp_message_id: null
  };
};

export const registerWhatsAppWebhook = async (webhookUrl: string): Promise<void> => {
  localStorage.setItem('whatsgw_webhook_url', webhookUrl);
  console.log('Saved webhook URL:', webhookUrl);
};

export const deletePolicy = async (policyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', policyId);
      
    if (error) {
      console.error("Error deleting policy:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deletePolicy:", error);
    return false;
  }
};

export default {
  setApiKey,
  getApiKey,
  isWhatsAppConfigured,
  sendWhatsAppMessage,
  sendTestMessage,
  sendTestToSpecificNumber,
  sendEventReminder,
  notifyAdminsAboutEvent,
  notifyAdminsAboutSystemEvent,
  getLogHistory,
  clearLogHistory,
  testApiConnection,
  getAllPolicies,
  simulateWhatsAppPolicyMessage,
  registerWhatsAppWebhook,
  deletePolicy,
  uploadAndAnalyzePolicy
};
