
import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  className,
  iconClassName,
}: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300",
        className
      )}
    >
      <div className="space-y-4">
        <div 
          className={cn(
            "inline-flex items-center justify-center rounded-lg p-3 text-primary bg-primary/10",
            iconClassName
          )}
        >
          {icon}
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      {/* Gradient hover effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-blue-400/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
    </div>
  );
};

export default FeatureCard;
