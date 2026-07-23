import { Building2, Calendar, ChevronRight, TrendingUp } from "lucide-react";
import { Link } from "react-router";
import { ThemeToggle } from "~/components/theme-toggle";

const navigationItems = [
  {
    name: "트렌드",
    href: "/trend",
    icon: TrendingUp,
    styles: {
      hoverBorder: "hover:border-blue-500/50",
      bgBlur: "bg-blue-500/5 dark:bg-blue-500/10",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10",
    }
  },
  {
    name: "일별 동향",
    href: "/date",
    icon: Calendar,
    styles: {
      hoverBorder: "hover:border-yellow-500/50",
      bgBlur: "bg-yellow-500/5 dark:bg-yellow-500/10",
      iconBg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/10",
    },
  },
  {
    name: "기업별 분석",
    href: "/company",
    icon: Building2,
    styles: {
      hoverBorder: "hover:border-green-500/50",
      bgBlur: "bg-green-500/5 dark:bg-green-500/10",
      iconBg: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/10",
    },
  },
];

export default function Header() {
  return (
    <header className="relative bg-card/70 border-b-2 py-4 px-6 sm:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-colors">
      <div>
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mt-3">
            오늘의 국민연금
          </h1>
        </Link>
      </div>
      <div className="flex gap-2 md:mr-10 lg:mr-14">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`group relative flex items-center rounded-2xl bg-card cursor-pointer border border-border hover:bg-muted/40 ${item.styles.hoverBorder} transition-all duration-300 p-2 items-center gap-3 text-sm font-medium text-foreground w-48`}
          >
            <div
              className={`absolute -top-12 -right-12 w-32 h-32 ${item.styles.bgBlur} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}
            />
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-2xl ${item.styles.iconBg} flex items-center justify-center border`}
            >
              <item.icon className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <h2 className="text-sm lg:text-base text-foreground flex items-center gap-1.5 whitespace-nowrap">
              {item.name}
              <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </h2>
          </Link>
        ))}
      </div>
      <div className="absolute right-6 top-1/2flex items-center justify-end">
        <ThemeToggle />
      </div>
    </header>
  );
}
