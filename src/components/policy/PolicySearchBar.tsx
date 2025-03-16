
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PolicySearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const PolicySearchBar = ({ searchTerm, setSearchTerm }: PolicySearchBarProps) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por cliente, seguradora ou número de apólice..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1"
      />
    </div>
  );
};

export default PolicySearchBar;
