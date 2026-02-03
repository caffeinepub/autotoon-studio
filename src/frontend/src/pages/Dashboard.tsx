import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useUserFiles } from '../hooks/useQueries';
import UploadSection from '../components/UploadSection';
import VideoGallery from '../components/VideoGallery';
import HeroSection from '../components/HeroSection';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
    const { identity, login, isInitializing } = useInternetIdentity();
    const { data: userFiles, isLoading: filesLoading } = useUserFiles();

    if (isInitializing) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!identity) {
        return (
            <div className="container mx-auto px-4 py-8">
                <HeroSection />
                <div className="mt-12 flex justify-center">
                    <Button onClick={login} size="lg" className="text-lg">
                        लॉगिन करें और शुरू करें
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-primary">
                    AutoToon Studio में आपका स्वागत है
                </h1>
                <p className="text-lg text-muted-foreground">
                    अपनी ऑडियो कहानियों को जीवंत कार्टून एनिमेशन में बदलें
                </p>
            </div>

            <UploadSection />

            {filesLoading ? (
                <div className="mt-12 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <VideoGallery files={userFiles || []} />
            )}
        </div>
    );
}
