export default function HeroSection() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8 shadow-lg">
            <div className="relative z-10 grid gap-8 md:grid-cols-2">
                <div className="flex flex-col justify-center">
                    <h2 className="mb-4 text-4xl font-bold text-primary">
                        अपनी कहानियों को जीवंत बनाएं
                    </h2>
                    <p className="mb-6 text-lg text-muted-foreground">
                        AutoToon Studio के साथ अपनी ऑडियो कहानियों को सुंदर कार्टून एनिमेशन में
                        बदलें। AI की शक्ति से, हम आपकी कहानी को दृश्यों में विभाजित करते हैं,
                        पात्रों को बनाते हैं, और एक पूर्ण एनिमेटेड वीडियो तैयार करते हैं।
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <FeatureCard
                            icon="/assets/generated/microphone-icon.dim_64x64.png"
                            title="ऑडियो अपलोड करें"
                            description="MP3 या WAV फ़ाइलें"
                        />
                        <FeatureCard
                            icon="/assets/generated/video-camera-icon.dim_64x64.png"
                            title="वीडियो बनाएं"
                            description="AI से एनिमेशन"
                        />
                        <FeatureCard
                            icon="/assets/generated/character-icon.dim_64x64.png"
                            title="पात्र बनाएं"
                            description="2D कार्टून स्टाइल"
                        />
                        <FeatureCard
                            icon="/assets/generated/download-icon.dim_64x64.png"
                            title="डाउनलोड करें"
                            description="MP4 फॉर्मेट में"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <img
                        src="/assets/generated/hero-banner.dim_800x400.png"
                        alt="AutoToon Studio Hero"
                        className="w-full rounded-xl shadow-2xl"
                    />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-lg bg-card p-4 shadow-sm">
            <img src={icon} alt={title} className="h-8 w-8" />
            <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
