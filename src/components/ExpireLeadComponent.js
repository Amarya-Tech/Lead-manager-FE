import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography
} from "@mui/material";
import apiClient from "../apicaller/APIClient";
import {cleanPayload} from "../utils/functions.js";

const ExpireLeadDialog = ({ open, onClose, leadId, userId, onSuccess }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) {
        setError("Comment is required.");
        return;
        }

        try {
        setSubmitting(true);
        setError("");

        const commentRes = await apiClient.post(
            `/lead-com/add-comments/${userId}/${leadId}`,
            { comment: comment.trim(),
              action: 'TO_EXPIRE'
             }
        );

        if (!commentRes.data.success) {
            setError("Failed to add comment. Please try again.");
            return;
        }

        const payload = cleanPayload({ status: "expired lead" });
        const updateRes = await apiClient.put(`/lead/update-lead/${leadId}`, payload);

         if (!updateRes?.data?.success) {
            setError("Failed to update lead status.");
            return;
            }


        const newLog = {
            id: Date.now(),
            comment: comment.trim(),
            created_date: new Date().toISOString(),
            created_by_name: "You"
        };
        if (typeof onSuccess === "function") {
            onSuccess(newLog);
        }

        setComment("");
        if (typeof onClose === "function") {
            onClose();
        }
        } catch (err) {
        console.error(err);
        setError("Something went wrong.");
        } finally {
        setSubmitting(false);
        }
    };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Expire Lead</DialogTitle>
      <DialogContent>
        <TextField
          label="Reason for expiring"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          autoFocus
          margin="normal"
        />
        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpireLeadDialog;
