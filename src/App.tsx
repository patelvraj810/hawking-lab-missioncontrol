import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MissionControlProvider } from "@/stores/mission-control";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AgentCommand from "./pages/AgentCommand";
import Projects from "./pages/Projects";
import TaskMonitor from "./pages/TaskMonitor";
import AgentLogs from "./pages/AgentLogs";
import MemoryViewer from "./pages/MemoryViewer";
import SystemState from "./pages/SystemState";
import ActivityTimeline from "./pages/ActivityTimeline";
import Collaboration from "./pages/Collaboration";
import OfficeMap from "./pages/OfficeMap";
import FileManager from "./pages/FileManager";
import HealthDashboard from "./pages/HealthDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MissionControlProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<AgentCommand />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<TaskMonitor />} />
              <Route path="/logs" element={<AgentLogs />} />
              <Route path="/memory" element={<MemoryViewer />} />
              <Route path="/system" element={<SystemState />} />
              <Route path="/timeline" element={<ActivityTimeline />} />
              <Route path="/collaboration" element={<Collaboration />} />
              <Route path="/office" element={<OfficeMap />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/health" element={<HealthDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MissionControlProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
