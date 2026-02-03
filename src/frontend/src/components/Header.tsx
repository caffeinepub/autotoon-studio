import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Header() {
    const { identity, login, clear } = useInternetIdentity();

    return (
        <header className="border-b border-border bg-card shadow-sm">
            <div className="container mx-auto flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                    <img
                        src="/assets/generated/autotoon-logo.dim_200x200.png"
                        alt="AutoToon Studio"
                        className="h-12 w-12 rounded-lg"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-primary">AutoToon Studio</h1>
                        <p className="text-sm text-muted-foreground">कार्टून एनिमेशन बनाएं</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {identity ? (
                        <>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {identity.getPrincipal().toString().slice(0, 8)}...
                                </span>
                            </div>
                            <Button onClick={clear} variant="outline" size="sm">
                                <LogOut className="mr-2 h-4 w-4" />
                                लॉगआउट
                            </Button>
                        </>
                    ) : (
                        <Button onClick={login} size="sm">
                            लॉगिन करें
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
