import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import ResultsPage from "./pages/ResultsPage";
import StatisticsPage from "./pages/StatisticsPage";
import ThreatsPage from "./pages/ThreatsPage";
import DatabasePage from "./pages/DatabasePage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <SidebarProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="history" element={<HistoryPage />} />
          {/* <Route path="statistics" element={<StatisticsPage />} />
          <Route path="threats" element={<ThreatsPage />} />
          <Route path="database" element={<DatabasePage />} /> */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </SidebarProvider>
  );
}

export default App;
