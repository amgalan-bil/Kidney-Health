"use client";
import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const GoalModal = ({ isOpen, onClose, onSave }) => {
  const [goal, setGoal] = useState("");

  const handleSave = () => {
    const goalAmount = parseInt(goal, 10);
    if (!isNaN(goalAmount) && goalAmount >= 0) {
      onSave(goalAmount);
      onClose();
    } else {
      alert("Please enter a valid number for your goal.");
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setGoal(value);
  };

  const formatNumber = (numStr) => {
    if (!numStr) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(numStr, 10));
  };

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="goal-modal-title">
      <Box sx={style}>
        <Typography id="goal-modal-title" variant="h6" component="h2">
          Set Your Donation Goal
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="goal"
          label="Goal Amount"
          name="goal"
          type="text"
          inputMode="numeric"
          value={formatNumber(goal)}
          onChange={handleAmountChange}
          placeholder="Enter amount"
          InputProps={{ inputProps: { maxLength: 10 } }}
        />
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GoalModal;
