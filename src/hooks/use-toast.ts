
// Re-export toast from sonner for usage throughout the app
import { toast } from "sonner";

export { toast };

// Custom hook for toast functionality
export const useToast = () => {
  return {
    toast
  };
};
