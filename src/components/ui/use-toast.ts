
import { toast } from "sonner";

export { toast };

// For compatibility with existing toaster.tsx
export const useToast = () => {
  return {
    toast,
    toasts: [] // Adding empty toasts array for compatibility
  };
};
