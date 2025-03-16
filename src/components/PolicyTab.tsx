
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from '@tanstack/react-query';
import { fetchPolicies } from '@/lib/policyService';
import PolicyTabContent from './policy/PolicyTabContent';
import StorageBucketInitializer from './policy/StorageBucketInitializer';

const PolicyTab = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [bucketReady, setBucketReady] = useState(false);
  const [configuringStorage, setConfiguringStorage] = useState(false);

  // Use React Query to fetch policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies', user?.id],
    queryFn: async () => fetchPolicies(user?.id || ''),
    enabled: !!user
  });

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
