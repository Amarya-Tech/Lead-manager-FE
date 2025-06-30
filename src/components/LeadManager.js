import { Routes, Route, useNavigate } from 'react-router-dom';
import LeadsLogTable from "./LeadsLogTable.js";
import LeadDetailsPage from "./LeadDetail.js";
import LeadLogsPage from "./LeadsLogs.js";

export default function LeadsManager({ searchTerm = "", statusFilter = "" }) {
  const navigate = useNavigate();

  const handleUpdateLead = (leadId) => {
    navigate(`update-lead/${leadId}`);
  };

  const handleViewLogs = (leadId) => {
    navigate(`view-lead-logs/${leadId}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LeadsLogTable
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onUpdateLead={handleUpdateLead}
            onViewLogs={handleViewLogs}
          />
        }
      />
      <Route path="update-lead/:leadId" element={<LeadDetailsPage />} />
      <Route path="view-lead-logs/:leadId" element={<LeadLogsPage />} />
    </Routes>
  );
}
