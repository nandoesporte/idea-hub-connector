
export interface PolicyFile {
  file: File;
  progress: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}
