import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Plans = lazy(() => import("./pages/Plans"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NewVideo = lazy(() => import("./pages/NewVideo"));
const MyVideos = lazy(() => import("./pages/MyVideos"));
const VoiceProfiles = lazy(() => import("./pages/VoiceProfiles"));
const Subscription = lazy(() => import("./pages/Subscription"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const ConductPage = lazy(() => import("./pages/ConductPage"));
const AdminSetup = lazy(() => import("./pages/AdminSetup"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/planos" component={Plans} />
        <Route path="/checkout/:slug" component={Checkout} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/novo-video" component={NewVideo} />
        <Route path="/meus-videos" component={MyVideos} />
        <Route path="/perfis-de-voz" component={VoiceProfiles} />
        <Route path="/assinatura" component={Subscription} />
        <Route path="/termos" component={TermsPage} />
        <Route path="/privacidade" component={PrivacyPage} />
        <Route path="/conduta" component={ConductPage} />
        <Route path="/admin/setup" component={AdminSetup} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
