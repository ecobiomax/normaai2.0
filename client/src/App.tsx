import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import HoroscopeToday from "./pages/HoroscopeToday";
import SignPage from "./pages/SignPage";
import MessagePage from "./pages/MessagePage";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminPanel from "./pages/AdminPanel";

function Router() {
  return (
    <Switch>
      {/* Home */}
      <Route path="/" component={Home} />

      {/* Static pages — must come before /:slug */}
      <Route path="/sobre" component={About} />
      <Route path="/politica-de-privacidade" component={PrivacyPolicy} />
      <Route path="/admin" component={AdminPanel} />

      {/* Horoscope pages — must come before /:slug */}
      <Route path="/horoscopo-de-hoje" component={HoroscopeToday} />
      <Route path="/horoscopo/:sign/:date" component={SignPage} />
      <Route path="/horoscopo/:sign" component={SignPage} />

      {/* Individual message — must come before /:slug */}
      <Route path="/mensagem/:slug" component={MessagePage} />

      {/* Category pages — catch-all slug */}
      <Route path="/:slug" component={CategoryPage} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              background: "#F8F4ED",
            }}
          >
            <Header />
            <div style={{ flex: 1 }}>
              <Router />
            </div>
            <Footer />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
