import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GenerationStep = 'idle' | 'uploading-audio' | 'creating-placeholder' | 'processing' | 'updating-status' | 'completed';

interface GenerationProgressProps {
    step: GenerationStep;
    progress: number;
    error?: string | null;
    onRetry?: () => void;
}

export default function GenerationProgress({ step, progress, error, onRetry }: GenerationProgressProps) {
    const steps = [
        { key: 'uploading-audio', label: 'Uploading audio', icon: Loader2 },
        { key: 'creating-placeholder', label: 'Creating video', icon: Loader2 },
        { key: 'processing', label: 'Processing animation', icon: Loader2 },
        { key: 'updating-status', label: 'Finalizing', icon: Loader2 },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);

    const getStepStatus = (index: number) => {
        if (error && index === currentStepIndex) return 'error';
        if (index < currentStepIndex) return 'completed';
        if (index === currentStepIndex) return 'active';
        return 'pending';
    };

    const getRetryLabel = () => {
        switch (step) {
            case 'uploading-audio':
                return 'Retry audio upload';
            case 'creating-placeholder':
                return 'Retry video creation';
            case 'processing':
                return 'Retry processing';
            case 'updating-status':
                return 'Retry status update';
            default:
                return 'Retry';
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {steps.map((stepItem, index) => {
                    const status = getStepStatus(index);
                    const Icon = stepItem.icon;

                    return (
                        <div key={stepItem.key} className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                {status === 'completed' && (
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                )}
                                {status === 'active' && (
                                    <Icon className="h-5 w-5 animate-spin text-primary" />
                                )}
                                {status === 'error' && (
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                )}
                                {status === 'pending' && (
                                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p
                                    className={`text-sm font-medium ${
                                        status === 'active'
                                            ? 'text-foreground'
                                            : status === 'completed'
                                            ? 'text-success'
                                            : status === 'error'
                                            ? 'text-destructive'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {stepItem.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {step !== 'idle' && step !== 'completed' && !error && (
                <Progress value={progress} className="h-2" />
            )}

            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-destructive">Error occurred</p>
                            <p className="text-sm text-destructive/80 mt-1">{error}</p>
                        </div>
                    </div>
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            variant="outline"
                            size="sm"
                            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                            {getRetryLabel()}
                        </Button>
                    )}
                </div>
            )}

            {step === 'completed' && (
                <div className="rounded-lg border border-success/50 bg-success/10 p-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <p className="text-sm font-medium text-success">
                            Video created successfully!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
