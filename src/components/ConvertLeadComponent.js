import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from "@mui/material";

const suitableProducts = ["transport", "import", "export"];

const ConvertLeadDialog = ({ open, onClose, onSubmit, status }) => {
  const [product, setProduct] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!comment.trim()) {
      setError("Comment is required");
      return;
    }

    if (status === "lead" && !product) {
      setError("Please select a suitable product");
      return;
    }

    onSubmit({ product, comment });
    setProduct("");
    setComment("");
    setError("");
    onClose();
  };

  const getDialogTitle = () => {
    switch (status) {
      case "lead":
        return "Convert to Prospect";
      case "prospect":
        return "Convert to Active Prospect";
      case "active prospect":
        return "Convert to Customer";
      default:
        return "Convert";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm"
        fullWidth
        PaperProps={{
            sx: {
            minWidth: '500px', 
            maxWidth: '600px', 
            padding: 2,
            },
        }}>
      <DialogTitle sx={{ fontSize: "20px", fontWeight: 600 }}>{getDialogTitle()}</DialogTitle>
      <DialogContent dividers sx={{
        minHeight: '200px',
        padding: 3,
        }}>
        {status === "lead" && (
          <TextField
            select
            label="Suitable Product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            fullWidth
            margin="normal"
          >
            {suitableProducts.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          label="Add Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          required
          autoFocus
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
        <Button onClick={onClose} variant="outlined" color="error">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertLeadDialog;
