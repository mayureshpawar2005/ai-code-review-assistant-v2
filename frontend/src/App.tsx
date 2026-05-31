import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CodeReview } from "./pages/CodeReview";
import { Dashboard } from "./pages/Dashboard";
import { DebugAssistant } from "./pages/DebugAssistant";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="review" element={<CodeReview />} />
          <Route path="debug" element={<DebugAssistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
