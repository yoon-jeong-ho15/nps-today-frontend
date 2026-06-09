import { Link } from "react-router";

export default function Footer(){
    return (
        <footer className="py-8 border-t border-border/40 flex divide-border/50 justify-between items-center px-14">
            <span className="text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} NPS Today. All rights reserved.
            </span>
            <Link to ="https://github.com/yoon-jeong-ho15/nps-today-frontend" className="inline-flex items-center gap-1 text-muted-foreground/80 hover:text-muted-foreground transition-colors mt-2">
                GitHub
            </Link>
      </footer>
    )
}