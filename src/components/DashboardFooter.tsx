import Link from "next/link";
import { Heart } from "lucide-react";

export function DashboardFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-(--color-border) bg-(--color-background) py-4 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <span>© {currentYear} vijad Projects. All rights reserved.</span>
                    </div>

                </div>
            </div>
        </footer>
    );
}
