import "./css/LeadsLogs.css";
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import apiClient from "../apicaller/APIClient.js";

export default function LeadLogsPage({ leadId, onBack }) {
    const userId = Cookies.get("user_id");
    const [leadLogs, setLeadLogs] = useState([]);
    const [leadInfo, setLeadInfo] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leadCommunicationId, setLeadCommunicationId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchLeadLogs = async () => {
            try {
                setIsLoading(true);
                const logsResponse = await apiClient.get(`/lead-com/fetch-lead-log-details/${userId}/${leadId}`);
                
                const leadResponse = await apiClient.get(`/lead/get-lead-detail/${leadId}`);
                
                if (Array.isArray(logsResponse.data.data)) {
                    setLeadLogs(logsResponse.data.data);
                     if (logsResponse.data.data.length > 0 && logsResponse.data.data[0].lead_communication_id) {
                        setLeadCommunicationId(logsResponse.data.data[0].lead_communication_id);
                    } else if (logsResponse.data.lead_communication_id) {
                        setLeadCommunicationId(logsResponse.data.lead_communication_id);
                    }
                } else {
                    console.error("Invalid logs data format:", logsResponse.data);
                    setLeadLogs([]);
                }

                if (leadResponse.data.data) {
                    setLeadInfo(leadResponse.data.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch lead logs:", error);
                setError("Failed to load lead logs. Please try again.");
                setLeadLogs([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (leadId) {
            fetchLeadLogs();
        }
    }, [leadId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim()) {
            setError("Please enter a comment before submitting.");
            return;
        }

         if (!leadCommunicationId) {
            setError("Lead communication ID not found. Please refresh the page.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const response = await apiClient.post(`/lead-com/add-comments/${userId}`, {
                lead_communication_id: leadCommunicationId,
                comment: newComment.trim(),
            });

            if (response.data.success) {
                const newLog = {
                    id: Date.now(),
                    comment: newComment.trim(),
                    date: new Date().toLocaleString(),
                    created_by: "You"
                };
                
                setLeadLogs([newLog, ...leadLogs]);
                setNewComment("");
            } else {
                setError("Failed to add comment. Please try again.");
            }
        } catch (error) {
            console.error("Failed to add comment:", error);
            setError("Failed to add comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch {
            return dateString.split(' ')[1] || dateString;
        }
    };

    const getDateGroup = (dateString) => {
        if (!dateString) return "Unknown";
        
        try {
            const date = new Date(dateString);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const dateStr = date.toDateString();
            const todayStr = today.toDateString();
            const yesterdayStr = yesterday.toDateString();
            
            if (dateStr === todayStr) return "Today";
            if (dateStr === yesterdayStr) return "Yesterday";
            
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch {
            return dateString.split(' ')[0] || "Unknown";
        }
    };

    const groupLogsByDate = (logs) => {
        const groups = {};
        logs.forEach(log => {
            const dateGroup = getDateGroup(log.created_date);
            if (!groups[dateGroup]) {
                groups[dateGroup] = [];
            }
            groups[dateGroup].push(log);
        });
        return groups;
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <p>Loading lead logs...</p>
            </div>
        );
    }

    return (
        <div className="lead-logs-container">
            {/* Header Section */}
            <div className="lead-logs-header">
                <div>
                    <h2 className="lead-logs-title">{leadInfo.company_name} Logs</h2>
                    {leadInfo && (
                        <p className="lead-info">
                            Company: <strong>{leadInfo.company_name}</strong> | 
                            Product: <strong>{leadInfo.product}</strong> | 
                            Status: <strong>{leadInfo.status}</strong>
                        </p>
                    )}
                </div>
                <button
                    onClick={onBack}
                    className="back-button"
                >
                    ← Back to Leads
                </button>
            </div>

            {/* Add New Comment Section */}
            <div className="add-comment-section">
                <h3 className="add-comment-title">Add Comment</h3>
                <form onSubmit={handleAddComment}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment"
                        rows="4"
                        className="comment-textarea"
                    />
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className={`submit-comment-button ${isSubmitting || !newComment.trim() ? 'disabled' : 'enabled'}`}
                    >
                        {isSubmitting ? "Adding Comment..." : "Add Comment"}
                    </button>
                </form>
            </div>

            {/* Logs Display Section */}
            <div className="logs-container">
                {leadLogs.length > 0 ? (
                    Object.entries(groupLogsByDate(leadLogs)).map(([dateGroup, logs]) => (
                        <div key={dateGroup} className="date-group">
                            <h4 className="date-header">{dateGroup}</h4>
                            {logs.map((log, index) => (
                                <div key={log.id || index} className="log-item">
                                    <div className="log-avatar">
                                        {getInitials(log.created_by_name || "You")}
                                    </div>
                                    <div className="log-content">
                                        <div className="log-header">
                                            <span className="log-user">
                                                {log.created_by_name || "You"}
                                            </span>
                                            <span className="log-time">
                                                {formatTime(log.created_date)}
                                            </span>
                                        </div>
                                        <p className="log-comment">
                                            {log.comment}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="no-logs-container">
                        <p className="no-logs-title">No comments found for this lead.</p>
                        <p className="no-logs-subtitle">
                            Add the first comment using the form above.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}