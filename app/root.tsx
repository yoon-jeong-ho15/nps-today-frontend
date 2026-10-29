import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [];

import { ThemeProvider } from "./provider/theme-provider";
import Header from "~/components/header";
import Footer from "~/components/footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground antialiased transition-colors">
        <ThemeProvider defaultTheme="light" storageKey="nps-ui-theme">
          <a className="skip-link" href="#main-content">
            본문 바로가기
          </a>
          <Header />
          <div className="app-workspace">
            <div id="main-content">{children}</div>
            <Footer />
          </div>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "페이지를 불러오지 못했어요";
  let details = "잠시 후 다시 시도하거나 대시보드로 돌아가주세요.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message =
      error.status === 404
        ? "페이지를 찾을 수 없어요"
        : "페이지를 불러오지 못했어요";
    details =
      error.status === 404
        ? "주소를 확인하거나 대시보드에서 다시 시작해보세요."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="dashboard-page">
      <div className="panel empty-state">
        <h1>{message}</h1>
        <p>{details}</p>
        <Link className="button button-primary" to="/">
          대시보드로 돌아가기
        </Link>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
