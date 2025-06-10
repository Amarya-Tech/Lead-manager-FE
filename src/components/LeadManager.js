// components/LeadsManager.js
import { useState } from "react";
import LeadsLogTable from "./LeadsLogTable.js";
import LeadDetailsPage from "./LeadDetail.js";
import LeadLogsPage from "./LeadsLogs.js";

export default function LeadsManager({ searchTerm = "" }) {
    const [currentView, setCurrentView] = useState('table');
    const [selectedLeadId, setSelectedLeadId] = useState(null);

    const handleUpdateLead = (leadId) => {
        setSelectedLeadId(leadId);
        setCurrentView('details');
    };

    const handleViewLogs = (leadId) => {
        setSelectedLeadId(leadId);
        setCurrentView('logs');
    };

    const handleBackToTable = () => {
        setCurrentView('table');
        setSelectedLeadId(null);
    };

    return (
        <div>
            {currentView === 'table' && (
                <LeadsLogTable 
                    searchTerm={searchTerm}
                    onUpdateLead={handleUpdateLead}
                    onViewLogs={handleViewLogs}
                />
            )}
            
            {currentView === 'details' && (
                <LeadDetailsPage 
                    leadId={selectedLeadId}
                    onBack={handleBackToTable}
                />
            )}
            
            {currentView === 'logs' && (
                <LeadLogsPage 
                    leadId={selectedLeadId}
                    onBack={handleBackToTable}
                />
            )}
        </div>
    );
}