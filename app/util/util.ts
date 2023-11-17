export enum SetupStage {
    NONE="",
    OPEN_SAFARI="Open in Safari",
    DOWNLOAD_PWA="Add to Home Screen",
    NOTIFS_DENIED="Notifications Denied",
    ENABLE_NOTIFS="Enable Notifications"
}

export function parseArtists(string: string) {
    return string.split(/, */).map((artist) => artist.trim()).filter(s => s != "");
}

export function getColorScheme(stageIdx: number) {
    return {
        bg: stageIdx == 0 ? 'bg-pink-600' : 'bg-emerald-600',
        bgLight: stageIdx == 0 ? 'bg-pink-50' : 'bg-emerald-50',
        bgLightSelected: stageIdx == 0 ? 'bg-pink-200' : 'bg-emerald-200',
        bgDark: stageIdx == 0 ? 'bg-pink-800' : 'bg-emerald-800',
        border: `border ${(stageIdx == 0 ? 'border-pink-600' : 'border-emerald-600')}`,
        text: stageIdx == 0 ? 'text-pink-600' : 'text-emerald-600',
        textLight: stageIdx == 0 ? 'text-pink-100' : 'text-emerald-100'
    };
}