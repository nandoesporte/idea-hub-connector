
import React, { useEffect } from 'react';
import { checkBucketExists, createStorageBucket } from '@/lib/policyService';

interface StorageBucketInitializerProps {
  userId?: string;
  setBucketReady: React.Dispatch<React.SetStateAction<boolean>>;
  setConfiguringStorage: React.Dispatch<React.SetStateAction<boolean>>;
}

const StorageBucketInitializer = ({ 
  userId, 
  setBucketReady, 
  setConfiguringStorage 
}: StorageBucketInitializerProps) => {
  // Check if bucket exists and create it if not
  useEffect(() => {
    const initializeStorage = async () => {
      setConfiguringStorage(true);
      try {
        // Check if bucket exists
        const exists = await checkBucketExists();
        
        if (!exists) {
          // Create bucket if it doesn't exist
          const success = await createStorageBucket();
          setBucketReady(success);
          if (!success) {
            console.error("Failed to automatically create storage bucket");
          }
        } else {
          setBucketReady(true);
        }
      } catch (error) {
        console.error("Error checking/creating storage bucket:", error);
      } finally {
        setConfiguringStorage(false);
      }
    };
    
    if (userId) {
      initializeStorage();
    }
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // This is a utility component with no UI
};

export default StorageBucketInitializer;
