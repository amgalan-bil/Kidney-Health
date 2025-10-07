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
          type="number"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter amount"
          InputProps={{ inputProps: { min: 0 } }}
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
