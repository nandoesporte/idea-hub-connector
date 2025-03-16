export interface PolicyData {
  id?: string;
  policy_number: string;
  customer: string;
  insurer: string;
  start_date: Date;
  end_date: Date;
  premium_amount: number;
  document_url?: string;
  status?: 'active' | 'pending' | 'expired';
  whatsapp_message_id?: string;
  processed_at?: Date;
  created_at?: Date;
}
