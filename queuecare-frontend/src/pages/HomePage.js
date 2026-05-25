import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Grid, Stack, Paper, } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
export const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useAuth();
    React.useEffect(() => {
        if (!loading && isAuthenticated) {
            if (user?.role === 'PATIENT') {
                navigate('/patient/dashboard', { replace: true });
            }
            else if (user?.role === 'DOCTOR') {
                navigate('/doctor/dashboard', { replace: true });
            }
            else if (user?.role === 'ADMIN') {
                navigate('/admin/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate, loading]);
    return (_jsxs(Box, { sx: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #5B7FFF 0%, #6A5AE0 45%, #8B5CF6 100%)',
            color: 'white',
        }, children: [_jsx(AppBar, { position: "static", elevation: 0, sx: {
                    bgcolor: 'transparent',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }, children: _jsxs(Toolbar, { sx: {
                        px: { xs: 2, md: 6 },
                        py: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }, children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(LocalHospitalIcon, { sx: { color: '#ffebee' } }), _jsx(Typography, { fontWeight: 800, fontSize: "1.5rem", children: "QueueCare" })] }), _jsx(Box, {}), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(Button, { variant: "contained", onClick: () => navigate('/login'), sx: {
                                        bgcolor: 'white',
                                        color: '#5B7FFF',
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        px: 3,
                                        '&:hover': {
                                            bgcolor: '#f3f4f6',
                                        },
                                    }, children: "Login" }), _jsx(Button, { variant: "outlined", onClick: () => navigate('/register'), sx: {
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        borderRadius: 2,
                                        px: 3,
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.08)',
                                        },
                                    }, children: "Sign Up" })] })] }) }), _jsx(Container, { maxWidth: "xl", children: _jsxs(Grid, { container: true, spacing: 8, alignItems: "center", sx: {
                        minHeight: '85vh',
                        py: 8,
                    }, children: [_jsxs(Grid, { item: true, xs: 12, md: 6, children: [_jsxs(Typography, { sx: {
                                        fontSize: { xs: '3rem', md: '5.5rem' },
                                        fontWeight: 900,
                                        lineHeight: 1.05,
                                    }, children: ["Skip the Wait.", _jsx("br", {}), "Book Smarter.", _jsx("br", {}), _jsx(Box, { component: "span", sx: {
                                                opacity: 0.5,
                                            }, children: "Heal Faster." })] }), _jsx(Typography, { sx: {
                                        mt: 4,
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: '1.2rem',
                                        lineHeight: 1.8,
                                        maxWidth: 600,
                                    }, children: "QueueCare connects patients with hospitals in real-time. Book appointments, track queues, and manage your health effortlessly." }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 3, mt: 5, children: [_jsx(Button, { size: "large", variant: "contained", onClick: () => navigate('/register'), sx: {
                                                bgcolor: 'white',
                                                color: '#5B7FFF',
                                                px: 5,
                                                py: 1.8,
                                                fontWeight: 700,
                                                borderRadius: '50px',
                                                textTransform: 'none',
                                                '&:hover': {
                                                    bgcolor: '#f3f4f6',
                                                },
                                            }, children: "Book an Appointment" }), _jsx(Button, { size: "large", variant: "outlined", onClick: () => navigate('/register'), sx: {
                                                borderColor: 'rgba(255,255,255,0.5)',
                                                color: 'white',
                                                px: 5,
                                                py: 1.8,
                                                borderRadius: '50px',
                                                textTransform: 'none',
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    bgcolor: 'rgba(255,255,255,0.08)',
                                                },
                                            }, children: "View Live Queue" })] })] }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Paper, { elevation: 0, sx: {
                                    p: 4,
                                    borderRadius: 6,
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(12px)',
                                }, children: _jsx(Grid, { container: true, spacing: 3, children: [
                                        {
                                            icon: _jsx(CalendarMonthIcon, {}),
                                            value: '12K+',
                                            label: 'Appointments Booked',
                                        },
                                        {
                                            icon: _jsx(GroupsIcon, {}),
                                            value: '340+',
                                            label: 'Hospitals Onboard',
                                        },
                                        {
                                            icon: _jsx(EmojiEmotionsIcon, {}),
                                            value: '98%',
                                            label: 'Patient Satisfaction',
                                        },
                                        {
                                            icon: _jsx(AccessTimeFilledIcon, {}),
                                            value: '~18 min',
                                            label: 'Avg. Wait Reduction',
                                        },
                                    ].map((item) => (_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(Paper, { elevation: 0, sx: {
                                                p: 4,
                                                borderRadius: 4,
                                                textAlign: 'center',
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                            }, children: [_jsx(Box, { sx: {
                                                        width: 60,
                                                        height: 60,
                                                        borderRadius: '50%',
                                                        bgcolor: 'rgba(255,255,255,0.12)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 3,
                                                    }, children: item.icon }), _jsx(Typography, { sx: {
                                                        fontSize: '2.2rem',
                                                        fontWeight: 900,
                                                        mb: 1,
                                                    }, children: item.value }), _jsx(Typography, { sx: {
                                                        color: 'rgba(255,255,255,0.8)',
                                                    }, children: item.label })] }) }, item.label))) }) }) })] }) }), _jsx(Box, { sx: {
                    bgcolor: '#f8f9ff',
                    color: '#111827',
                    py: 12,
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                }, children: _jsxs(Container, { maxWidth: "lg", children: [_jsx(Typography, { align: "center", sx: {
                                color: '#6A5AE0',
                                fontWeight: 700,
                                mb: 2,
                                letterSpacing: 1,
                            }, children: "HOW IT WORKS" }), _jsxs(Typography, { align: "center", sx: {
                                fontSize: { xs: '2rem', md: '3rem' },
                                fontWeight: 800,
                                mb: 8,
                            }, children: ["Book an appointment in", ' ', _jsx(Box, { component: "span", sx: { color: '#6A5AE0' }, children: "3 simple steps" })] }), _jsx(Grid, { container: true, spacing: 4, children: [
                                {
                                    icon: _jsx(SearchIcon, { fontSize: "large" }),
                                    title: 'Find Hospital',
                                    desc: 'Search hospitals and departments near you.',
                                    step: '01',
                                },
                                {
                                    icon: _jsx(EventAvailableIcon, { fontSize: "large" }),
                                    title: 'Pick a Slot',
                                    desc: 'Select your preferred time slot instantly.',
                                    step: '02',
                                },
                                {
                                    icon: _jsx(CheckCircleIcon, { fontSize: "large" }),
                                    title: 'Confirm & Track',
                                    desc: 'Track your queue in real-time.',
                                    step: '03',
                                },
                            ].map((item) => (_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsxs(Paper, { elevation: 3, sx: {
                                        p: 5,
                                        borderRadius: 5,
                                        height: '100%',
                                    }, children: [_jsx(Box, { sx: {
                                                width: 80,
                                                height: 80,
                                                borderRadius: 4,
                                                bgcolor: '#ede9fe',
                                                color: '#6A5AE0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 4,
                                            }, children: item.icon }), _jsx(Typography, { sx: {
                                                color: '#6A5AE0',
                                                fontWeight: 700,
                                                mb: 2,
                                            }, children: item.step }), _jsx(Typography, { sx: {
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                mb: 2,
                                            }, children: item.title }), _jsx(Typography, { sx: {
                                                color: '#6b7280',
                                                lineHeight: 1.8,
                                            }, children: item.desc })] }) }, item.title))) })] }) }), _jsx(Box, { sx: {
                    bgcolor: '#ffffff',
                    py: 12,
                    color: '#111827',
                }, children: _jsxs(Container, { maxWidth: "lg", children: [_jsx(Typography, { align: "center", sx: {
                                color: '#6A5AE0',
                                fontWeight: 700,
                                mb: 2,
                            }, children: "FEATURES" }), _jsxs(Typography, { align: "center", sx: {
                                fontSize: { xs: '2rem', md: '3rem' },
                                fontWeight: 800,
                                mb: 10,
                            }, children: ["Everything you need for a", ' ', _jsx(Box, { component: "span", sx: { color: '#6A5AE0' }, children: "smarter" }), ' ', "healthcare experience"] }), _jsx(Grid, { container: true, spacing: 5, children: [
                                {
                                    icon: _jsx(AccessTimeIcon, {}),
                                    title: 'Real-time Queue Tracking',
                                    desc: 'Know your queue position in real-time.',
                                },
                                {
                                    icon: _jsx(NotificationsActiveIcon, {}),
                                    title: 'Instant Notifications',
                                    desc: 'Receive updates and reminders instantly.',
                                },
                                {
                                    icon: _jsx(SecurityIcon, {}),
                                    title: 'Secure & Private',
                                    desc: 'Industry-level encrypted healthcare data.',
                                },
                                {
                                    icon: _jsx(DescriptionIcon, {}),
                                    title: 'Digital Health Records',
                                    desc: 'Store prescriptions and reports digitally.',
                                },
                            ].map((feature) => (_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Stack, { direction: "row", spacing: 3, children: [_jsx(Box, { sx: {
                                                width: 70,
                                                height: 70,
                                                borderRadius: 4,
                                                bgcolor: '#ede9fe',
                                                color: '#6A5AE0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }, children: feature.icon }), _jsxs(Box, { children: [_jsx(Typography, { sx: {
                                                        fontSize: '1.4rem',
                                                        fontWeight: 700,
                                                        mb: 1,
                                                    }, children: feature.title }), _jsx(Typography, { sx: {
                                                        color: '#6b7280',
                                                        lineHeight: 1.8,
                                                    }, children: feature.desc })] })] }) }, feature.title))) })] }) })] }));
};
export default HomePage;
