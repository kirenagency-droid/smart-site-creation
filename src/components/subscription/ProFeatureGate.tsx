import { ReactNode, useState } from 'react';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/useCredits';
import { UpgradeModal } from './UpgradeModal';

interface ProFeatureGateProps {
  feature: 'custom_domain' | 'remove_badge' | 'create_project';
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProFeatureGate = ({ 
  feature, 
  featureName, 
  children, 
  fallback 
}: ProFeatureGateProps) => {
  const { canUseFeature, planLimits, loading } = useCredits();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasAccess = canUseFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div className="relative">
        {/* Locked Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-10 flex flex-col items-center justify-center p-4">
          <div className="p-3 rounded-full bg-primary/10 mb-3">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold text-center mb-1">
            Fonctionnalité Pro
          </h4>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {featureName} nécessite un abonnement Pro
          </p>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => setShowUpgrade(true)}
          >
            <Crown className="w-4 h-4" />
            Passer à Pro
          </Button>
        </div>

        {/* Blurred Content */}
        <div className="opacity-30 pointer-events-none blur-sm">
          {children}
        </div>
      </div>

      {showUpgrade && (
        <UpgradeModal 
          feature={featureName}
          reason="pro_feature"
          onClose={() => setShowUpgrade(false)} 
        />
      )}
    </>
  );
};

// Simple button that triggers upgrade modal for non-Pro users
export const ProFeatureButton = ({
  feature,
  featureName,
  children,
  onClick,
  ...buttonProps
}: {
  feature: 'custom_domain' | 'remove_badge' | 'create_project';
  featureName: string;
  children: ReactNode;
  onClick?: () => void;
} & React.ComponentProps<typeof Button>) => {
  const { canUseFeature, loading } = useCredits();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const hasAccess = canUseFeature(feature);

  const handleClick = () => {
    if (hasAccess) {
      onClick?.();
    } else {
      setShowUpgrade(true);
    }
  };

  return (
    <>
      <Button 
        {...buttonProps} 
        onClick={handleClick}
        disabled={loading}
      >
        {!hasAccess && <Lock className="w-4 h-4 mr-2" />}
        {children}
      </Button>

      {showUpgrade && (
        <UpgradeModal 
          feature={featureName}
          reason="pro_feature"
          onClose={() => setShowUpgrade(false)} 
        />
      )}
    </>
  );
};
