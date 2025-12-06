import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DeploymentLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  createdAt: Date;
}

interface DeploymentLogsProps {
  logs: DeploymentLog[];
}

export const DeploymentLogs = ({ logs }: DeploymentLogsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const displayedLogs = isExpanded ? logs : logs.slice(0, 3);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Logs de déploiement</CardTitle>
          {logs.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs gap-1"
            >
              {isExpanded ? (
                <>
                  Réduire <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Voir tout ({logs.length}) <ChevronDown className="w-3 h-3" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayedLogs.map((log) => (
            <div 
              key={log.id}
              className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/30"
            >
              {getIcon(log.level)}
              <div className="flex-1 min-w-0">
                <p className="text-foreground/80">{log.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {log.createdAt.toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
