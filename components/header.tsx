import { Building2, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { ThemeToggle } from "~/components/theme-toggle";

const navigationItems = [
    {
        name: "일별 거래 동향",
        href: "/date",
        icon: Calendar,
        color: "yellow",
    },
    {
        name: "기업별 매매 분석",
        href: "/company",
        icon: Building2,
        color: "emerald",
    },
];

export default function Header() {
    return (
        <header className="bg-card/70 border-b-2 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 transition-colors">
            <div>
                <Link to="/" className="flex items-center gap-2">
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tight mt-3">
                        오늘의 국민연금
                    </h1>
                </Link>
            </div>
            <div className="flex gap-2">
                {navigationItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`group relative flex items-center rounded-2xl bg-card cursor-pointer border border-border hover:bg-muted/40 hover:border-${item.color}-500/50 transition-all duration-300 p-4 items-center gap-3 text-sm font-medium text-foreground`}
                    >
                        <div className={`absolute -top-12 -right-12 w-32 h-32 bg-${item.color}-500/5 dark:bg-${item.color}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                        <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400 flex items-center justify-center border border-${item.color}-500/10`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl text-foreground flex items-center gap-1.5">
                            {item.name}
                            <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </h2>
                    </Link>
                ))}
            </div>  
            <div className="flex items-center justify-end">
                <ThemeToggle />
            </div>
        </header>
    )
}