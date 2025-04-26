import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import LearningSetup from "./pages/LearningSetup";
import RoadmapGenerator from "./pages/RoadmapGenerator";
import RoadmapView from "./pages/RoadmapView";
import Assistant from "./pages/Assistant";
import CoffeeAndCode from "./pages/CoffeeAndCode";
import Projects from "./pages/Projects";
import Community from "./pages/Community";
import Navbar from "./components/Navbar";
import Settings from "./pages/Settings";
import Learning from "./pages/Learning";
const queryClient = new QueryClient();

// Layout component that includes the Navbar
const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <Outlet />
      </main>
    </>
  );
};

const App = () => (
  <ThemeProvider>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="learning" element={<Learning />} />
                <Route path="/learning-setup" element={<LearningSetup />} />
                <Route path="/roadmap/generate" element={<RoadmapGenerator />} />
                <Route path="/roadmap/:id" element={<RoadmapView />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/coffee-and-code" element={<CoffeeAndCode />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/community" element={<Community />} />
                <Route path="/settings" element={<Settings />} />

                <Route path="*" element={<NotFound />} />
              </Route>
              {/* Auth page without navbar */}
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
