
import React, { useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';

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
  
  useEffect(() => {
    if (!userId) return;
    
    // Start with configuration in progress
    setConfiguringStorage(true);
    
    const checkBucket = async () => {
      try {
        // Verify authentication
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError || !authData.session) {
          console.error("Authentication error:", authError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Authentication error. Please log in again.");
          return;
        }
        
        console.log("User authenticated, checking storage bucket");
        
        // Check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.error("Error listing buckets:", bucketError);
          setBucketReady(false);
          setConfiguringStorage(false);
          toast.error("Unable to access storage system");
          return;
        }
        
        // Check if 'policy_documents' bucket exists
        const policyBucket = buckets.find(bucket => bucket.name === 'policy_documents');
        
        if (policyBucket) {
          // Double check if we have access to this bucket by listing files
          const { data: files, error: filesError } = await supabase.storage
            .from('policy_documents')
            .list(userId);
            
          if (filesError) {
            console.error("Error accessing policy_documents bucket:", filesError);
            setBucketReady(false);
            toast.error("Storage access error. Contact administrator.");
          } else {
            console.log("Bucket 'policy_documents' found and ready to use");
            setBucketReady(true);
          }
        } else {
          console.log("Bucket 'policy_documents' not found. This bucket must be created by an administrator.");
          toast.error("Storage system is not available. Contact administrator.");
          setBucketReady(false);
        }
        
      } catch (err) {
        console.error("Unexpected error checking storage:", err);
        toast.error("Error verifying storage system");
        setBucketReady(false);
      } finally {
        setConfiguringStorage(false);
      }
    };
    
    checkBucket();
  }, [userId, setBucketReady, setConfiguringStorage]);

  return null; // This is a utility component with no UI
};

export default StorageBucketInitializer;
