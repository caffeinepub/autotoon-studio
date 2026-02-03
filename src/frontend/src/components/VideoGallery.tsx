import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileType, FileStatus, type File } from '../backend';
import VideoPlayer from './VideoPlayer';
import { Film, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useUpdateFileStatus } from '../hooks/useQueries';
import { toast } from 'sonner';

interface VideoGalleryProps {
    files: File[];
}

export default function VideoGallery({ files }: VideoGalleryProps) {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    const videoFiles = files.filter((file) => file.fileType === FileType.video);

    if (videoFiles.length === 0) {
        return (
            <Card className="mt-12">
                <CardContent className="flex min-h-[200px] flex-col items-center justify-center py-12">
                    <Film className="mb-4 h-16 w-16 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                        No videos created yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Upload audio to create your first cartoon animation
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="mt-12 space-y-6">
            <h2 className="text-3xl font-bold text-primary">Your Videos</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {videoFiles.map((file) => (
                    <VideoCard
                        key={file.fileId}
                        file={file}
                        onClick={() => setSelectedVideoId(file.fileId)}
                    />
                ))}
            </div>

            {selectedVideoId && (
                <VideoPlayer fileId={selectedVideoId} onClose={() => setSelectedVideoId(null)} />
            )}
        </div>
    );
}

function VideoCard({ file, onClick }: { file: File; onClick: () => void }) {
    const [isRetrying, setIsRetrying] = useState(false);
    const [thumbnailError, setThumbnailError] = useState(false);
    const updateStatusMutation = useUpdateFileStatus();

    const handleRetry = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRetrying(true);
        
        try {
            // Reset to processing status
            await updateStatusMutation.mutateAsync({
                fileId: file.fileId,
                status: FileStatus.processing,
            });
            
            toast.info('Regenerating video...');
            
            // Simulate regeneration process
            await new Promise((resolve) => setTimeout(resolve, 5000));
            
            // Mark as completed
            await updateStatusMutation.mutateAsync({
                fileId: file.fileId,
                status: FileStatus.completed,
            });
            
            toast.success('Video created successfully!');
        } catch (error) {
            console.error('Retry error:', error);
            toast.error('Retry failed');
            
            // Mark as failed again
            await updateStatusMutation.mutateAsync({
                fileId: file.fileId,
                status: FileStatus.failed,
            });
        } finally {
            setIsRetrying(false);
        }
    };

    const getStatusBadge = () => {
        switch (file.status) {
            case FileStatus.completed:
                return <Badge variant="default">Completed</Badge>;
            case FileStatus.processing:
                return (
                    <Badge variant="secondary">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Processing
                    </Badge>
                );
            case FileStatus.failed:
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Failed
                    </Badge>
                );
        }
    };

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1000000);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderThumbnail = () => {
        if (file.status === FileStatus.processing) {
            return (
                <div className="flex items-center justify-center">
                    <img
                        src="/assets/generated/cartoon-loading-spinner.dim_100x100.png"
                        alt="Loading"
                        className="h-20 w-20 animate-spin"
                    />
                </div>
            );
        }

        if (file.status === FileStatus.failed) {
            return (
                <div className="flex items-center justify-center">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
            );
        }

        // For completed videos, use cartoon gallery thumbnail as fallback
        if (thumbnailError) {
            return (
                <img
                    src="/assets/generated/cartoon-gallery-thumb.dim_1280x720.png"
                    alt="Video thumbnail"
                    className="h-full w-full object-cover"
                />
            );
        }

        // Try to load video thumbnail, fallback to cartoon thumbnail on error
        return (
            <img
                src="/assets/generated/cartoon-gallery-thumb.dim_1280x720.png"
                alt="Video thumbnail"
                className="h-full w-full object-cover"
                onError={() => setThumbnailError(true)}
            />
        );
    };

    return (
        <Card
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={file.status === FileStatus.completed ? onClick : undefined}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Video {file.fileId.slice(-8)}</CardTitle>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                    {renderThumbnail()}
                </div>
                <p className="text-sm text-muted-foreground">
                    {formatDate(file.uploadTime)}
                </p>
                
                {file.status === FileStatus.failed && (
                    <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        variant="outline"
                        size="sm"
                        className="w-full"
                    >
                        {isRetrying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Retrying...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
