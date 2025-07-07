import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import DiscordEmbedManager from "@/pages/discord-embed-manager";
import Home from "@/pages/home";

function Router() {
  const [, setLocation] = useLocation();

  const handleLoginRedirect = () => {
    setLocation("/login");
  };

  return (
    <Switch>
      <Route path="/" component={() => <Home onLoginRedirect={handleLoginRedirect} />} />
      <Route path="/login" component={DiscordEmbedManager} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
