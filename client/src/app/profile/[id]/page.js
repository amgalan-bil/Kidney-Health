"use client";
import React, { useContext, useEffect, useState, useCallback } from "react";
import { get, post } from "../../api";
import { useParams } from "next/navigation";
import { AppContent } from "@/app/context/AppContext";
// MUI Components
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Link as MuiLink,
  Avatar,
} from "@mui/material";
const UserProfile = () => {
  const params = useParams();
  const { id } = params;
  const { userData: loggedInUserData } = useContext(AppContent);

  // Profile user state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Donation Dialog State
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState(null);
  const [qpayData, setQpayData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  const formatNumber = (numStr) => {
    if (!numStr) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(numStr, 10));
  };

  const fetchUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await get(`/api/v1/users/${id}`);
      if (data && data.success) {
        setUser(data.user);
      } else {
        setError(data.message || "Хэрэглэгчийн мэдээлэл татахад алдаа гарлаа.");
      }
    } catch (err) {
      setError(err.message || "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleCheckPaymentDialog = useCallback(async () => {
    if (!qpayData?.invoice_id || isChecking) return;
    setIsChecking(true);
    try {
      const data = await post(
        `/api/v1/donation/check-payment/${qpayData.invoice_id}`
      );
      if (data.success) {
        setPaymentStatus(data);
        if (data.status === "PAID") {
          await fetchUser(); // Re-fetch user to show updated amount
        }
      }
    } catch (err) {
      // Don't show an error for polling, only for manual checks if desired
    } finally {
      setIsChecking(false);
    }
  }, [qpayData, isChecking, fetchUser]);

  useEffect(() => {
    if (qpayData && paymentStatus?.status !== "PAID") {
      const intervalId = setInterval(() => {
        handleCheckPaymentDialog();
      }, 3000); // Check every 3 seconds

      return () => clearInterval(intervalId);
    }
  }, [qpayData, paymentStatus, handleCheckPaymentDialog]);

  const handleOpenDialog = () => {
    setName(loggedInUserData?.name || "");
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setQpayData(null);
    setDonationError(null);
    setAmount("");
    setMessage("");
    setName("");
    setPaymentStatus(null);
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setDonationLoading(true);
    setDonationError(null);
    setQpayData(null);

    try {
      const data = await post("/api/v1/donation/create-invoice", {
        amount: parseInt(amount, 10),
        userId: user._id,
        name: name || "Anonymous",
        message,
      });

      if (data && data.success) {
        setQpayData(data.qpayData);
      } else {
        setDonationError(
          data.message || "QPay нэхэмжлэх үүсгэхэд алдаа гарлаа."
        );
      }
    } catch (err) {
      setDonationError(err.message || "Гэнэтийн алдаа гарлаа.");
    } finally {
      setDonationLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="warning">Хэрэглэгч олдсонгүй.</Alert>
      </Container>
    );
  }

  const progress =
    user.goal > 0
      ? Math.min((user?.totalDonatedAmount / user?.goal) * 100, 100)
      : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{ width: 96, height: 96, mb: 2, bgcolor: "primary.main" }}
          >
            <Typography variant="h3">{user.name.charAt(0)}</Typography>
          </Avatar>
          <Typography
            className="text-center"
            variant="h4"
            component="h1"
            fontWeight="bold"
          >
            {user.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              mb: 1,
            }}
          >
            <Typography
              variant="h4"
              component="p"
              fontWeight="bold"
              color="success.main"
            >
              {(user.totalDonatedAmount || 0).toLocaleString()}₮
              <Typography component="span" color="text.secondary">
                {" "}
                цугласан
              </Typography>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Зорилго: {(user.goal || 0).toLocaleString()}₮
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button variant="contained" size="large" onClick={handleOpenDialog}>
            {user.name}-н зорилгыг дэмжих
          </Button>
        </Box>
      </Paper>

      {/* Donation Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">{user.name}-д хандивлах</DialogTitle>
        <DialogContent>
          {!qpayData ? (
            <Box
              component="form"
              id="donation-form"
              onSubmit={handleDonate}
              sx={{ pt: 1 }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Таны нэр"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    InputProps={{ readOnly: !!loggedInUserData }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Хандивын дүн (MNT)"
                    type="text"
                    value={formatNumber(amount)}
                    onChange={handleAmountChange}
                    fullWidth
                    required
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Зурвас (заавал биш)"
                    multiline
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Box>
              {donationError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {donationError}
                </Alert>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                {paymentStatus?.status === "PAID"
                  ? "Хандив амжилттай!"
                  : "Төлбөрөө гүйцэтгэнэ үү"}
              </Typography>
              {paymentStatus?.status === "PAID" ? (
                <Alert severity="success" sx={{ my: 2 }}>
                  {paymentStatus.message}
                </Alert>
              ) : (
                <>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Доорх QR кодыг уншуулна уу.
                  </Typography>
                  <Box
                    component="img"
                    src={`data:image/jpeg;base64,${qpayData.qr_image}`}
                    alt="QPay QR Code"
                    sx={{
                      width: 250,
                      height: 250,
                      my: 2,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                    }}
                  />
                  <Grid container spacing={1} justifyContent="center">
                    {qpayData.urls.map((link) => (
                      <Grid item key={link.name}>
                        <MuiLink
                          href={link.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="none"
                        >
                          <img
                            src={link.logo}
                            alt={link.description}
                            style={{ height: 40, width: "auto" }}
                          />
                        </MuiLink>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button onClick={handleCloseDialog}>
            {paymentStatus?.status === "PAID" ? "Хаах" : "Цуцлах"}
          </Button>
          {!qpayData ? (
            <Button
              type="submit"
              form="donation-form"
              variant="contained"
              disabled={donationLoading}
            >
              {donationLoading ? <CircularProgress size={24} /> : "QR код авах"}
            </Button>
          ) : paymentStatus?.status !== "PAID" ? (
            <Button
              variant="contained"
              onClick={handleCheckPaymentDialog}
              disabled={isChecking}
            >
              {isChecking ? <CircularProgress size={24} /> : "Төлбөр шалгах"}
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;
