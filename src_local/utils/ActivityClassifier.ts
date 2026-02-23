/**
 * 🕵️ ActivityClassifier — Helper for classifying user focus.
 */
export class ActivityClassifier {
    static classify(app: string, title: string): string {
        const app_l = app.toLowerCase();
        const title_l = title.toLowerCase();

        if (this.isDev(app_l)) return "DEV";
        if (this.isGaming(app_l)) return "GAMING";
        if (this.isBrowsing(app_l)) return this.isMedia(title_l) ? "MEDIA" : "BROWSING";

        return "GENERAL";
    }

    private static isDev(app: string): boolean {
        return ["code", "powershell", "cmd", "wt", "pycharm", "cursor"].includes(app);
    }

    private static isGaming(app: string): boolean {
        return ["steam", "valorant", "cs2", "minecraft"].includes(app);
    }

    private static isBrowsing(app: string): boolean {
        return ["chrome", "msedge", "firefox", "brave"].includes(app);
    }

    private static isMedia(title: string): boolean {
        return title.includes("youtube") || title.includes("netflix");
    }
}
