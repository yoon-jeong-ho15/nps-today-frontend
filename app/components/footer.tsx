import { ArrowUpRight } from "lucide-react";
export default function Footer() {
  return (
    <footer className="app-footer">
      <span>
        © {new Date().getFullYear()} NPS today{" "}
        <span className="footer-divider">/</span> 데이터를 이해하는 더 쉬운 방법
      </span>
      <a
        href="https://github.com/yoon-jeong-ho15/nps-today-frontend"
        target="_blank"
        rel="noreferrer"
      >
        GitHub <ArrowUpRight size={12} />
      </a>
    </footer>
  );
}
