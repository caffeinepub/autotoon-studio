import { SiGithub } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="text-center text-sm text-muted-foreground sm:text-left">
                        © 2025. Built with{' '}
                        <Heart className="inline h-4 w-4 fill-red-500 text-red-500" /> using{' '}
                        <a
                            href="https://caffeine.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                        >
                            caffeine.ai
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            <SiGithub className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
