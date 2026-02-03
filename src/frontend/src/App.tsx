import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    <Dashboard />
                </main>
                <Footer />
            </div>
            <Toaster />
        </ThemeProvider>
    );
}

export default App;
