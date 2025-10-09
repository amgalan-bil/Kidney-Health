import React from "react";
import Link from "next/link";
import { Box, Typography, Button, Container } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const ThankYou = () => {
  return (
    <Container
      component="main"
      maxWidth="sm"
      className="text-black"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <CheckCircleOutlineIcon
          sx={{ fontSize: 60, color: "success.main", mb: 2 }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Хандив өгсөнд баярлалаа!
        </Typography>
        <Typography variant="subtitle1">
          Таны дэмжлэг бидэнд маш чухал.
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Нүүр хуудас руу буцах
        </Button>
      </Box>
    </Container>
  );
};

export default ThankYou;
