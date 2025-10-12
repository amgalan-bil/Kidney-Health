"use client";
import React, { useState, useContext, useEffect, useCallback } from "react";
import { get, post } from "../api";
import { AppContent } from "../context/AppContext";
import { useRouter } from "next/navigation";

// MUI Components
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Link as MuiLink,
  Collapse,
  Autocomplete,
  InputAdornment,
} from "@mui/material";

// MUI Icons
import { QrCode, CreditCard, ArrowBack } from "@mui/icons-material";

import SearchIcon from "@mui/icons-material/Search";

const Donate = () => {
  const { userData } = useContext(AppContent);

  // Form State
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // User fetching state
  const [userOptions, setUserOptions] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // UI/API State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qpayData, setQpayData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const router = useRouter();

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };

  const formatNumber = (numStr) => {
    if (!numStr) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(numStr, 10));
  };

  useEffect(() => {
    if (qpayData && paymentStatus?.status !== "PAID") {
      const intervalId = setInterval(() => {
        handleCheckPayment();
      }, 3000); // Check every 3 seconds

      // Cleanup function to stop polling when the component unmounts
      // or when the user navigates away from the QR code view.
      return () => clearInterval(intervalId);
    }
  }, [qpayData, paymentStatus]);

  const fetchUsers = useCallback(
    async (page, search) => {
      if (loadingUsers) return;
      setLoadingUsers(true);
      try {
        const data = await get(
          `/api/v1/users/all?page=${page}&limit=20&search=${search}`
        );
        if (data.success) {
          setUserOptions((prev) =>
            page === 1 ? data.users : [...prev, ...data.users]
          );
          setHasMoreUsers(
            data.pagination.currentPage < data.pagination.totalPages
          );
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoadingUsers(false);
      }
    },
    [] // Remove loadingUsers from the dependency array
  );

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setDonorName(userData.name);
      setSelectedUserId(userData.userId);
    } else {
      // Initial fetch for anonymous users
      setUserPage(1);
      setUserOptions([]);
      fetchUsers(1, "");
    }
  }, [userData, fetchUsers]);

  // Effect for handling search
  useEffect(() => {
    if (!userData) {
      const handler = setTimeout(() => {
        setUserPage(1);
        setUserOptions([]);
        setHasMoreUsers(true);
        fetchUsers(1, userSearch);
      }, 500); // Debounce search
      return () => clearTimeout(handler);
    }
  }, [userSearch, userData, fetchUsers]);

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQpayData(null);
    setPaymentStatus(null);

    const userId = userData ? userData.userId : selectedUserId;
    const sendingName = userData ? userData.name : donorName;

    if (!userId) {
      setError(
        "Could not identify the user to donate to. Please select a user from the list."
      );
      setLoading(false);
      return;
    }

    try {
      const data = await post("/api/v1/donation/create-invoice", {
        amount: parseInt(amount, 10),
        userId,
        name: sendingName,
        message,
      });

      if (data && data.success) {
        setQpayData(data?.qpayData);
      } else {
        setError(data.message || "Failed to create QPay invoice.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentStatus?.status === "PAID") {
      const timer = setTimeout(() => {
        router.push("/thank-you");
      }, 3000); // Redirect after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handleCheckPayment = async () => {
    if (!qpayData?.invoice_id) return;
    setIsChecking(true);
    setPaymentStatus(null);
    setError(null);
    try {
      const data = await post(
        `/api/v1/donation/check-payment/${qpayData.invoice_id}`
      );
      if (data.success) {
        setPaymentStatus(data);
      } else {
        setError("Could not check payment status.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while checking payment.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <QrCode color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
          <Typography variant="h5" component="h2" fontWeight="bold">
            QPay-ээр хандивлах
          </Typography>
        </Box>

        <Collapse in={!qpayData} timeout="auto" unmountOnExit>
          <Box component="form" onSubmit={handleDonate} noValidate>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {userData ? (
                <TextField
                  label="Нэр"
                  value={name}
                  fullWidth
                  required
                  InputProps={{
                    readOnly: true,
                  }}
                />
              ) : (
                <Autocomplete
                  options={userOptions}
                  getOptionLabel={(option) =>
                    option.name ? `${option.name} (${option.email})` : ""
                  }
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  onChange={(event, newValue) => {
                    setSelectedUserId(newValue ? newValue._id : null);
                    setSelectedUser(newValue);
                  }}
                  onInputChange={(event, newInputValue) => {
                    setUserSearch(newInputValue);
                  }}
                  loading={loadingUsers}
                  ListboxProps={{
                    onScroll: (event) => {
                      const listboxNode = event.currentTarget;
                      if (
                        listboxNode.scrollTop + listboxNode.clientHeight >=
                          listboxNode.scrollHeight - 1 &&
                        hasMoreUsers &&
                        !loadingUsers
                      ) {
                        const nextPage = userPage + 1;
                        setUserPage(nextPage);
                        fetchUsers(nextPage, userSearch);
                      }
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Дэмжих хүнээ сонгох"
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon /> хайх
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {loadingUsers ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
              <TextField
                label="Таны нэр"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                fullWidth
                required
                type="text"
              />
              <TextField
                label="Хандивын дүн (MNT)"
                type="text"
                value={formatNumber(amount)}
                onChange={handleAmountChange}
                fullWidth
                required
                inputProps={{ maxLength: 10 }}
              />
              <TextField
                label="Зурвас (заавал биш)"
                multiline
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, py: 1.5, fontSize: "1.1rem" }}
            >
              {loading ? (
                <CircularProgress size={26} color="inherit" />
              ) : (
                "QR үүсгэх"
              )}
            </Button>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Collapse>

        <Collapse in={!!qpayData} timeout="auto" unmountOnExit>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Төлбөрөө гүйцэтгэнэ үү
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Доорх QR кодыг уншуулна уу эсвэл банкны апп-г сонгоно уу.
            </Typography>
            <Box
              component="img"
              src={`data:image/jpeg;base64,${qpayData?.qr_image}`}
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
              {qpayData?.urls.map((link) => (
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

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCheckPayment}
                disabled={isChecking}
              >
                {isChecking ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Төлбөр шалгах"
                )}
              </Button>
              {paymentStatus && (
                <Alert
                  severity={
                    paymentStatus.status === "PAID" ? "success" : "info"
                  }
                  sx={{ mt: 2, justifyContent: "center" }}
                >
                  {paymentStatus.message}
                </Alert>
              )}
            </Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => {
                setQpayData(null);
                setPaymentStatus(null);
              }}
              sx={{ mt: 3 }}
            >
              Буцах
            </Button>
          </Box>
        </Collapse>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CreditCard color="success" sx={{ mr: 1.5, fontSize: 32 }} />
          <Typography variant="h5" component="h2" fontWeight="bold">
            Бусад сонголтууд
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              href="https://donorbox.org/little-faces-big-smile"
              target="_blank"
            >
              International / Donorbox
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Donate;
