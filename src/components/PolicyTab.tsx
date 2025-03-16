
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from '@tanstack/react-query';
import { fetchPolicies, checkStorageAccess } from '@/lib/policyService';
import PolicyTabContent from './policy/PolicyTabContent';
import StorageBucketInitializer from './policy/StorageBucketInitializer';

const PolicyTab = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [bucketReady, setBucketReady] = useState(false);
  const [configuringStorage, setConfiguringStorage] = useState(false);

  // Use React Query to fetch policies with proper error handling
  const { data: policies = [], isLoading, refetch, error } = useQuery({
    queryKey: ['policies', user?.id],
    queryFn: async () => fetchPolicies(user?.id || ''),
    enabled: !!user && bucketReady,
    retry: 2,
    onError: (err) => {
      console.error("Error fetching policies:", err);
    }
  });

  // Continuously check storage access if not ready
  useEffect(() => {
    if (user?.id && !bucketReady && !configuringStorage) {
      const verifyAccess = async () => {
        try {
          const isAccessible = await checkStorageAccess(user.id);
          if (isAccessible) {
            console.log("Storage access verified successfully");
            setBucketReady(true);
            refetch();
          } else {
            console.log("Storage access check failed");
          }
        } catch (error) {
          console.error("Error verifying storage access:", error);
        }
      };
      
      verifyAccess();
    }
  }, [user?.id, bucketReady, configuringStorage, refetch]);

  const handleClearSearch = () => setSearchTerm("");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Apólices de Seguro</CardTitle>
            </div>
          </div>
          <CardDescription>
            Gerencie apólices de seguro recebidas via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage initializer component - will attempt to set up the storage system */}
          <StorageBucketInitializer 
            userId={user?.id} 
            setBucketReady={setBucketReady}
            setConfiguringStorage={setConfiguringStorage}
          />
          
          <PolicyTabContent 
            policies={policies}
            isLoading={isLoading}
            configuringStorage={configuringStorage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onClearSearch={handleClearSearch}
            bucketReady={bucketReady}
            userId={user?.id || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyTab;
