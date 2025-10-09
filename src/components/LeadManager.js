import { Routes, Route, useNavigate } from 'react-router-dom';
import LeadsLogTable from "./LeadsLogTable.js";
import LeadDetailsPage from "./LeadDetail.js";
import LeadLogsPage from "./LeadsLogs.js";

export default function LeadsManager({ searchTerm = "", statusFilter = "", selectedCompany = null }) {
  const navigate = useNavigate();

  const handleUpdateLead = (leadId) => {
    navigate(`/leads/update-lead/${leadId}`);
  };

  const handleViewLogs = (leadId) => {
    navigate(`/leads/view-lead-logs/${leadId}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LeadsLogTable
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            selectedCompany={selectedCompany}
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
