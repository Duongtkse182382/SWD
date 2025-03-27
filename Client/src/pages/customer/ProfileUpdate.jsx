import { useState, useEffect } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    IconButton,
    TextField,
    Typography,
    InputAdornment,
    Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import axios from "../../utils/axiosInstance";
// import CustomerSidebar from "@/components/CustomerSidebar";
import CustomerSidebar from "../../components/CustomerSideBar";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { Fab } from "@mui/material";


const CustomerProfile = () => {
    const userId =
        localStorage.getItem("userId") || sessionStorage.getItem("userId");
    const [formData, setFormData] = useState({
        CurrentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [customer, setCustomer] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomerData();
    }, []);

    const fetchCustomerData = async () => {
        try {
            const { data } = await axios.get(`/api/customers/${userId}`);
            setCustomer(data);
        } catch (error) {
            console.error("Error fetching customer data", error);
        }
    };

    const handleChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await axios.put(`/api/customers/${userId}`, customer); // Change to PUT for updating
            setIsEditing(false);
            setSuccess("Cập nhật thành công!");
            localStorage.removeItem("fullName");
            localStorage.setItem(
                "fullName",
                `${customer.firstName} ${customer.lastName}`
            );
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setError("Error updating profile. Please try again.");
            console.error("Error updating profile", error);
        }
    };

    const handlePasswordUpdate = async () => {
        setError("");
        setSuccess("");

        if (!formData.currentPassword) {
            setError("Current password is required.");
            return;
        }

        if (!formData.newPassword) {
            setError("New password is required.");
            return;
        }

        if (!passwordRegex.test(formData.newPassword)) {
            setError(
                "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
            );
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        try {
            await axios.post(`/api/customers/change-password`, {
                userId, // Fixing uppercase issue
                currentPassword: formData.currentPassword, // Fixing uppercase issue
                newPassword: formData.newPassword,
            });
            setSuccess("Password updated successfully!");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Error updating password. Please try again."
            );
            console.error("Error updating password:", error);
        }
    };

    return (
        <div className="main-container w-full h-full bg-[#d4ccd0] relative mx-auto my-0">
            <div className="flex">
                <div className="w-[250px] min-w-[250px]">
                    <CustomerSidebar />
                </div>
                <div className="flex-1 p-4">
                    <Box p={4} maxWidth="800px" mx="auto">
                        <Card
                            sx={{
                                p: 4,
                                boxShadow: 4,
                                borderRadius: 4,
                                backgroundColor: "#ffffff",
                            }}
                        >
                            <CardContent>
                                <Box textAlign="center">
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mx: "auto",
                                            mb: 2,
                                            color: "white",
                                            bgcolor: "#A7DFEC",
                                        }}
                                    >
                                        User
                                    </Avatar>
                                    <Typography variant="h6" className="text-[#2B6A7C]">
                                        {customer.firstName} {customer.lastName}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <IconButton onClick={() => setIsEditing(!isEditing)}>
                                        {isEditing ? (
                                            <SaveIcon
                                                className="radius"
                                                color="primary"
                                                sx={{
                                                    backgroundColor: "#A7DFEC",
                                                    color: "white",
                                                    borderRadius: "50%", // Make the icon circular
                                                    fontSize: 40, // Reduce icon size
                                                    padding: 1, // Add padding to make the icon smaller than the circle
                                                    "&:hover": { backgroundColor: "#2B6A7C" },
                                                }}
                                            />
                                        ) : (
                                            <EditIcon
                                                className="radius"
                                                color="primary"
                                                sx={{
                                                    backgroundColor: "#A7DFEC",
                                                    color: "white",
                                                    borderRadius: "50%", // Make the icon circular
                                                    fontSize: 40, // Reduce icon size
                                                    padding: 1, // Add padding to make the icon smaller than the circle
                                                    "&:hover": { backgroundColor: "#2B6A7C" },
                                                }}
                                            />
                                        )}
                                    </IconButton>
                                </Box>
                                {error && <Alert severity="error">{error}</Alert>}
                                {success && <Alert severity="success">{success}</Alert>}
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    mt={2}
                                    className="text-[#2B6A7C]"
                                >
                                    Thông tin cá nhân
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Họ"
                                            name="Họ"
                                            fullWidth
                                            value={customer.firstName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "gray", // Default border color
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "#2B6A7C", // Border color on hover
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#2B6A7C", // Border color when focused
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "#000000", // Changes the text color inside the field
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "gray", // Default label color
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#2B6A7C", // Label color when focused
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Tên"
                                            name="Tên"
                                            fullWidth
                                            value={customer.lastName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "gray", // Default border color
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "#2B6A7C", // Border color on hover
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#2B6A7C", // Border color when focused
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "#000000", // Changes the text color inside the field
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "gray", // Default label color
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#2B6A7C", // Label color when focused
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Số điện thoại"
                                            name="Số điện thoại"
                                            fullWidth
                                            value={customer.phoneNumber}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "gray", // Default border color
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "#2B6A7C", // Border color on hover
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#2B6A7C", // Border color when focused
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "#000000", // Changes the text color inside the field
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "gray", // Default label color
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#2B6A7C", // Label color when focused
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <br />
                                {isEditing && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{
                                            backgroundColor: "#A7DFEC",
                                            color: "white",
                                            "&:hover": { backgroundColor: "#2B6A7C" },
                                        }}
                                        onClick={handleSave}
                                    >
                                        Lưu và Thay đổi
                                    </Button>
                                )}
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    mt={4}
                                    className="text-[#2B6A7C]"
                                >
                                    Thay đổi mật khẩu
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Mật khẩu hiện tại"
                                            name="currentPassword"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "gray", // Default border color
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "#2B6A7C", // Border color on hover
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#2B6A7C", // Border color when focused (clicked)
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "#000000", // Changes the text color inside the field
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "gray", // Default label color
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#2B6A7C", // Label color when focused
                                                },
                                            }}
                                            type={showCurrentPassword ? "text" : "password"}
                                            fullWidth
                                            value={formData.currentPassword}
                                            onChange={handlePasswordChange}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() =>
                                                                setShowCurrentPassword(!showCurrentPassword)
                                                            }
                                                        >
                                                            {showCurrentPassword ? (
                                                                <Visibility />
                                                            ) : (
                                                                <VisibilityOff />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Mât khẩu mới"
                                            name="newPassword"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "gray", // Default border color
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "#2B6A7C", // Border color on hover
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#2B6A7C", // Border color when focused (clicked)
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "#000000", // Changes the text color inside the field
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "gray", // Default label color
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#2B6A7C", // Label color when focused
                                                },
                                            }}
                                            type={showNewPassword ? "text" : "password"}
                                            fullWidth
                                            value={formData.newPassword}
                                            onChange={handlePasswordChange}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() =>
                                                                setShowNewPassword(!showNewPassword)
                                                            }
                                                        >
                                                            {showNewPassword ? (
                                                                <Visibility />
                                                            ) : (
                                                                <VisibilityOff />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Xác nhận mật khẩu mới"
                                            name="confirmPassword"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "gray", // Default border color
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "#2B6A7C", // Border color on hover
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#2B6A7C", // Border color when focused (clicked)
                                                    },
                                                },
                                                "& .MuiInputBase-input": {
                                                    color: "#000000", // Changes the text color inside the field
                                                },
                                                "& .MuiInputLabel-root": {
                                                    color: "gray", // Default label color
                                                },
                                                "& .MuiInputLabel-root.Mui-focused": {
                                                    color: "#2B6A7C", // Label color when focused
                                                },
                                            }}
                                            type={showConfirmNewPassword ? "text" : "password"}
                                            fullWidth
                                            value={formData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() =>
                                                                setShowConfirmNewPassword(
                                                                    !showConfirmNewPassword
                                                                )
                                                            }
                                                        >
                                                            {showConfirmNewPassword ? (
                                                                <Visibility />
                                                            ) : (
                                                                <VisibilityOff />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <br />
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#A7DFEC",
                                        color: "white",
                                        "&:hover": { backgroundColor: "#2B6A7C" },
                                    }}
                                    fullWidth
                                    onClick={handlePasswordUpdate}
                                >
                                    Câp nhật mật khẩu
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                    <Fab
                        color="primary"
                        aria-label="home"
                        onClick={() => navigate("/")}
                        sx={{
                            position: "fixed",
                            bottom: 20,
                            right: 20,
                            backgroundColor: "#2B6A7C",
                            "&:hover": { backgroundColor: "#A7DFEC" },
                        }}
                    >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2B6A7C] opacity-75"></span>
                        <HomeIcon />
                    </Fab>;
                </div>
            </div>
        </div>

    );
};

export default CustomerProfile;