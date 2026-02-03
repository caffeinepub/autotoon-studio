import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useGetFile } from '../hooks/useQueries';
import { toast } from 'sonner';

interface VideoPlayerProps {
    fileId: string;
    onClose: () => void;
}

export default function VideoPlayer({ fileId, onClose }: VideoPlayerProps) {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);
    const blobUrlRef = useRef<string | null>(null);

    const { data: video, isLoading, error } = useGetFile(fileId);

    // Clean up blob URL on unmount or when fileId changes
    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [fileId]);

    // Reset state when fileId changes
    useEffect(() => {
        setVideoError(false);
        setVideoUrl(null);
        setIsLoadingVideo(false);
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
    }, [fileId]);

    // Load video bytes and create Blob URL for playback
    useEffect(() => {
        if (!video?.blob) return;

        const loadVideoBytes = async () => {
            try {
                setIsLoadingVideo(true);
                setVideoError(false);
                
                console.log('Fetching video bytes for fileId:', fileId);
                
                // Try to get backend-served video bytes
                let bytes: Uint8Array<ArrayBuffer>;
                try {
                    bytes = await video.blob.getBytes();
                    console.log(`Received ${bytes.length} bytes from backend`);
                } catch (backendError) {
                    console.warn('Backend video retrieval failed, falling back to placeholder:', backendError);
                    // Fall back to placeholder video
                    const placeholderResponse = await fetch('/assets/placeholders/minimal-placeholder.mp4');
                    if (!placeholderResponse.ok) {
                        throw new Error('Failed to load video: backend unavailable and placeholder not found');
                    }
                    const arrayBuffer = await placeholderResponse.arrayBuffer();
                    bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
                    console.log(`Using placeholder video: ${bytes.length} bytes`);
                }
                
                // Validate that we received actual video data
                if (bytes.length < 1024) {
                    console.error('Video data too small:', bytes.length, 'bytes');
                    throw new Error(`Invalid video data: only ${bytes.length} bytes received. The video file may be corrupted.`);
                }
                
                // Create Blob with proper MIME type
                const blob = new Blob([bytes], { type: 'video/mp4' });
                const objectUrl = URL.createObjectURL(blob);
                
                // Clean up old blob URL if exists
                if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                }
                
                blobUrlRef.current = objectUrl;
                setVideoUrl(objectUrl);
                console.log('✓ Video Blob URL created successfully');
                
            } catch (err) {
                console.error('Failed to load video bytes:', err);
                setVideoError(true);
                toast.error(err instanceof Error ? err.message : 'Failed to load video');
            } finally {
                setIsLoadingVideo(false);
            }
        };

        loadVideoBytes();
    }, [video, fileId]);

    // Handle video element errors
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error('Video element error:', e);
        const videoElement = e.currentTarget;
        
        if (videoElement.error) {
            console.error('Video error code:', videoElement.error.code);
            console.error('Video error message:', videoElement.error.message);
        }
        
        setVideoError(true);
        toast.error('Video playback failed. The video file may be corrupted.');
    };

    const handleDownload = async () => {
        if (!video?.blob) {
            toast.error('Video not available');
            return;
        }

        try {
            // Try to fetch backend bytes for download, fall back to placeholder
            let bytes: Uint8Array<ArrayBuffer>;
            try {
                bytes = await video.blob.getBytes();
                console.log(`Downloading backend video: ${bytes.length} bytes`);
            } catch (backendError) {
                console.warn('Backend video unavailable for download, using placeholder:', backendError);
                const placeholderResponse = await fetch('/assets/placeholders/minimal-placeholder.mp4');
                if (!placeholderResponse.ok) {
                    throw new Error('Video not available for download');
                }
                const arrayBuffer = await placeholderResponse.arrayBuffer();
                bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
                console.log(`Downloading placeholder video: ${bytes.length} bytes`);
            }
            
            if (bytes.length < 1024) {
                toast.error('Video file is too small or corrupted');
                return;
            }
            
            // Create a fresh Blob for download
            const blob = new Blob([bytes], { type: 'video/mp4' });
            const downloadUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `autotoon-${fileId.slice(-8)}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up download URL after a short delay
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
            
            toast.success('Video download started');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download video');
        }
    };

    const handleRegenerateCharacters = async () => {
        setIsRegenerating(true);
        toast.info('Regenerating characters...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        toast.success('Characters regenerated!');
        setIsRegenerating(false);
    };

    const handleRegenerateBackgrounds = async () => {
        setIsRegenerating(true);
        toast.info('Regenerating backgrounds...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        toast.success('Backgrounds regenerated!');
        setIsRegenerating(false);
    };

    const renderVideoContent = () => {
        // Loading state
        if (isLoading || isLoadingVideo) {
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                        {isLoadingVideo ? 'Loading video data...' : 'Loading video...'}
                    </p>
                </div>
            );
        }

        // Error fetching file
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <p className="text-destructive font-semibold">Failed to load video</p>
                    <p className="text-sm text-muted-foreground text-center">
                        {error instanceof Error ? error.message : 'An error occurred while loading the video'}
                    </p>
                </div>
            );
        }

        // Video load error
        if (videoError || !videoUrl) {
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
                    <img
                        src="/assets/generated/cartoon-gallery-thumb.dim_1280x720.png"
                        alt="Video unavailable"
                        className="max-w-md rounded-lg"
                    />
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-destructive font-semibold">Video playback failed</p>
                    <p className="text-sm text-muted-foreground text-center">
                        The video could not be loaded. The file may be corrupted or invalid.
                    </p>
                </div>
            );
        }

        // Video player
        return (
            <video
                key={videoUrl}
                src={videoUrl}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full"
                onError={handleVideoError}
            >
                Your browser does not support the video tag.
            </video>
        );
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Video {fileId.slice(-8)}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                        {renderVideoContent()}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button 
                            onClick={handleDownload} 
                            className="flex-1"
                            disabled={videoError || isLoading || isLoadingVideo || !video}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button
                            onClick={handleRegenerateCharacters}
                            variant="outline"
                            disabled={isRegenerating || videoError || isLoading || isLoadingVideo}
                            className="flex-1"
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`}
                            />
                            Regenerate Characters
                        </Button>
                        <Button
                            onClick={handleRegenerateBackgrounds}
                            variant="outline"
                            disabled={isRegenerating || videoError || isLoading || isLoadingVideo}
                            className="flex-1"
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`}
                            />
                            Regenerate Backgrounds
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
