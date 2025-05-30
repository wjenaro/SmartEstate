import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle2 } from 'lucide-react';
import { useAccountScoping } from '@/hooks/useAccountScoping';

interface AccountBadgeProps {
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

/**
 * A consistent badge component for displaying account type across the application
 */
export function AccountBadge({ 
  className = '', 
  showIcon = true, 
  showLabel = true 
}: AccountBadgeProps) {
  const { getAccountTypeInfo } = useAccountScoping();
  const accountInfo = getAccountTypeInfo();
  
  if (accountInfo.type === 'unauthenticated') {
    return null;
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`ml-2 ${accountInfo.className} ${className}`}
    >
      {showIcon && accountInfo.type === 'demo' && (
        <Crown className="w-3 h-3 mr-1" />
      )}
      
      {showIcon && (accountInfo.type === 'trial' || accountInfo.type === 'standard') && (
        <CheckCircle2 className="w-3 h-3 mr-1" />
      )}
      
      {showLabel && accountInfo.label}
    </Badge>
  );
}
