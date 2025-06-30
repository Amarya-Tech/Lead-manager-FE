import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from "../apicaller/APIClient.js";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Paper,
    Avatar,
    Divider,
    Stack
} from '@mui/material';

export default function LeadLogsPage() {
    const userId = Cookies.get("user_id");
    const { leadId } = useParams();
    const navigate = useNavigate();
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
                const logsResponse = await apiClient.get(`/lead-com/fetch-lead-log-details/${leadId}`);
                const leadResponse = await apiClient.get(`/lead/get-lead-detail/${leadId}`);

                if (Array.isArray(logsResponse.data.data)) {
                    setLeadLogs(logsResponse.data.data);
                    if (logsResponse.data.data.length > 0 && logsResponse.data.data[0].lead_communication_id) {
                        setLeadCommunicationId(logsResponse.data.data[0].lead_communication_id);
                    } else if (logsResponse.data.lead_communication_id) {
                        setLeadCommunicationId(logsResponse.data.lead_communication_id);
                    }
                } else {
                    setLeadLogs([]);
                }

                if (leadResponse.data.data) {
                    setLeadInfo(leadResponse.data.data[0]);
                }
            } catch (error) {
                setError("Failed to load lead logs. Please try again.");
                setLeadLogs([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (leadId) fetchLeadLogs();
    }, [leadId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setError("Please enter a comment before submitting.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const response = await apiClient.post(`/lead-com/add-comments/${userId}/${leadId}`, {
                comment: newComment.trim(),
            });

            if (response.data.success) {
                const newLog = {
                    id: Date.now(),
                    comment: newComment.trim(),
                    created_date: new Date().toISOString(),
                    created_by_name: "You"
                };
                setLeadLogs([newLog, ...leadLogs]);
                setNewComment("");
            } else {
                setError("Failed to add comment. Please try again.");
            }
        } catch {
            setError("Failed to add comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            if (dateStr === today.toDateString()) return "Today";
            if (dateStr === yesterday.toDateString()) return "Yesterday";

            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return dateString.split(' ')[0] || "Unknown";
        }
    };

    const groupLogsByDate = (logs) => {
        const groups = {};
        logs.forEach(log => {
            const dateGroup = getDateGroup(log.created_date);
            if (!groups[dateGroup]) groups[dateGroup] = [];
            groups[dateGroup].push(log);
        });
        return groups;
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isLoading) return <Box p={4}><CircularProgress /></Box>;

    return (
        <Box p={4} m={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5">{leadInfo?.company_name} Logs</Typography>
                    <Typography variant="body2">
                        Company: <strong>{leadInfo?.company_name}</strong> | Product: <strong>{leadInfo?.product}</strong> | Status: <strong>{leadInfo?.status}</strong>
                    </Typography>
                </Box>
                <Button
                    onClick={() => navigate(-1)}
                    sx={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&:hover': {
                        backgroundColor: '#5a6268',
                        },
                    }}
                    >
                    ← Back to Leads
                    </Button>
            </Box>

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Add Comment</Typography>
                <TextField
                    multiline
                    fullWidth
                    rows={4}
                    placeholder="Add a comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    error={!!error}
                    helperText={error}
                />
                <Button
                    onClick={handleAddComment}
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={isSubmitting || !newComment.trim()}
                >
                    {isSubmitting ? "Adding Comment..." : "Add Comment"}
                </Button>
            </Paper>

            {leadLogs.length > 0 ? (
                Object.entries(groupLogsByDate(leadLogs)).map(([dateGroup, logs]) => (
                    <Box key={dateGroup} mb={4}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>{dateGroup}</Typography>
                    {logs.map((log, idx) => {
                        const isActionLog = log.action && log.action.toUpperCase() !== 'COMMENT';

                        return (
                        <Paper
                            key={log.id || idx}
                            sx={{
                            p: 2,
                            mb: 2,
                            backgroundColor: isActionLog ? '#f0f9ff' : '#ffffff',
                            borderLeft: isActionLog ? '4px solid #2196f3' : 'none', 
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar>{getInitials(log.created_by_name || 'You')}</Avatar>
                            <Box sx={{ width: '100%' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography fontWeight="bold" noWrap>
                                    {log.created_by_name || 'You'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {formatTime(log.created_date)}
                                </Typography>
                                </Box>

                                {isActionLog && (
                                <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    sx={{ mt: 1, color: '#0d47a1' }}
                                >
                                    ACTION: {log.action}
                                </Typography>
                                )}

                                {/* Comment always displayed */}
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                {log.comment}
                                </Typography>
                            </Box>
                            </Stack>
                        </Paper>
                        );
                    })}
                    </Box>
                ))
                ) : (
                <Typography variant="body2">No comments found for this lead. Add the first comment above.</Typography>
                )}

        </Box>
    );
}
