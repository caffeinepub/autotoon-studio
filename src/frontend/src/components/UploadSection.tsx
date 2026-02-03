import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useUploadFile, useUpdateFileStatus } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { FileType, FileStatus, ExternalBlob } from '../backend';
import { toast } from 'sonner';
import GenerationProgress from './GenerationProgress';
import { loadPlaceholderVideo } from '../utils/placeholderVideo';
import { normalizeError } from '../utils/errors';

type GenerationStep = 'idle' | 'uploading-audio' | 'creating-placeholder' | 'processing' | 'updating-status' | 'completed';

export default function UploadSection() {
    const [isDragging, setIsDragging] = useState(false);
    const [currentStep, setCurrentStep] = useState<GenerationStep>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [uploadedAudioBlob, setUploadedAudioBlob] = useState<ExternalBlob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { actor, isFetching: actorInitializing } = useActor();
    const uploadFileMutation = useUploadFile();
    const updateStatusMutation = useUpdateFileStatus();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (actorInitializing || !actor) return;
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (actorInitializing || !actor) {
            toast.error('System is initializing. Please wait a moment.');
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        const audioFile = files.find((file) =>
            file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')
        );

        if (audioFile) {
            handleFileUpload(audioFile);
        } else {
            toast.error('Please upload an audio file');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (actorInitializing || !actor) {
            toast.error('System is initializing. Please wait a moment.');
            return;
        }

        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (actorInitializing || !actor) {
            toast.error('System is initializing. Please wait a moment.');
            return;
        }

        const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        setCurrentFileId(fileId);
        setError(null);
        setUploadProgress(0);

        try {
            // Step 1: Upload audio file
            setCurrentStep('uploading-audio');
            const audioBytes = new Uint8Array(await file.arrayBuffer()) as Uint8Array<ArrayBuffer>;
            const audioBlob = ExternalBlob.fromBytes(audioBytes).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
            });

            await uploadFileMutation.mutateAsync({
                fileId,
                fileType: FileType.audio,
                blob: audioBlob,
            });

            // Store the uploaded audio blob for potential retry
            setUploadedAudioBlob(audioBlob);

            toast.success('Audio uploaded successfully!');

            // Step 2: Create placeholder video
            await createPlaceholderVideo(fileId);

        } catch (err) {
            const errorMessage = normalizeError(err);
            console.error('Upload error:', err);
            setError(errorMessage);
            setCurrentStep('idle');
            toast.error(errorMessage);
        }
    };

    const createPlaceholderVideo = async (fileId: string) => {
        try {
            setCurrentStep('creating-placeholder');
            setUploadProgress(0);

            // Load and validate placeholder video
            const placeholderBytes = await loadPlaceholderVideo();
            
            console.log(`Creating video with ${placeholderBytes.length} bytes`);
            
            const videoBlob = ExternalBlob.fromBytes(placeholderBytes).withUploadProgress((percentage) => {
                setUploadProgress(percentage);
            });

            const videoFileId = `video-${fileId}`;

            await uploadFileMutation.mutateAsync({
                fileId: videoFileId,
                fileType: FileType.video,
                blob: videoBlob,
            });

            // Step 3: Simulate processing
            setCurrentStep('processing');
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Step 4: Update status to completed
            setCurrentStep('updating-status');
            await updateStatusMutation.mutateAsync({
                fileId: videoFileId,
                status: FileStatus.completed,
            });

            setCurrentStep('completed');
            toast.success('Video created successfully!');

            // Reset after a delay
            setTimeout(() => {
                setCurrentStep('idle');
                setCurrentFileId(null);
                setUploadedAudioBlob(null);
                setUploadProgress(0);
            }, 2000);

        } catch (err) {
            const errorMessage = normalizeError(err);
            console.error('Placeholder creation error:', err);
            
            // Surface placeholder-specific errors directly to user
            const detailedError = errorMessage.includes('placeholder') || errorMessage.includes('MP4')
                ? errorMessage 
                : `Failed to create video: ${errorMessage}`;
            
            setError(detailedError);
            setCurrentStep('idle');
            toast.error(detailedError);
        }
    };

    const handleRetry = async () => {
        if (!currentFileId) return;

        setError(null);
        
        // If we have the uploaded audio, skip re-upload and go straight to placeholder creation
        if (uploadedAudioBlob) {
            await createPlaceholderVideo(currentFileId);
        } else {
            // Otherwise, user needs to re-upload
            toast.info('Please upload the file again');
            setCurrentStep('idle');
            setCurrentFileId(null);
        }
    };

    const isProcessing = currentStep !== 'idle' && currentStep !== 'completed';
    const isDisabled = isProcessing || actorInitializing || !actor;

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-2xl">Upload Audio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div
                    className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                        isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50'
                    } ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isDisabled}
                    />

                    <div className="flex flex-col items-center space-y-4">
                        <div className="rounded-full bg-primary/10 p-6">
                            {isProcessing || actorInitializing ? (
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            ) : (
                                <Upload className="h-12 w-12 text-primary" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-lg font-medium">
                                {actorInitializing
                                    ? 'Initializing...'
                                    : isProcessing
                                    ? 'Processing...'
                                    : 'Drag and drop your audio file here'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {actorInitializing ? 'Please wait' : 'or click to select a file'}
                            </p>
                        </div>

                        {!isDisabled && (
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                size="lg"
                                className="mt-4"
                            >
                                Select File
                            </Button>
                        )}
                    </div>
                </div>

                {isProcessing && (
                    <GenerationProgress 
                        step={currentStep} 
                        progress={uploadProgress}
                        error={error}
                        onRetry={handleRetry}
                    />
                )}
            </CardContent>
        </Card>
    );
}
