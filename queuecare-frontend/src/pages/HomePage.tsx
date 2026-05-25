import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Stack,
  Paper,
} from '@mui/material';

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

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.role === 'PATIENT') {
        navigate('/patient/dashboard', { replace: true });
      } else if (user?.role === 'DOCTOR') {
        navigate('/doctor/dashboard', { replace: true });
      } else if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, loading]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #5B7FFF 0%, #6A5AE0 45%, #8B5CF6 100%)',
        color: 'white',
      }}
    >
      {/* NAVBAR */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'transparent',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar
          sx={{
            px: { xs: 2, md: 6 },
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {/* LOGO */}
          <Stack direction="row" spacing={1} alignItems="center">
            <LocalHospitalIcon sx={{ color: '#ffebee' }} />

            <Typography fontWeight={800} fontSize="1.5rem">
              QueueCare
            </Typography>
          </Stack>

          {/* EMPTY SPACE */}
          <Box />

          {/* AUTH BUTTONS */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: 'white',
                color: '#5B7FFF',
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  bgcolor: '#f3f4f6',
                },
              }}
            >
              Login
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* HERO */}
      <Container maxWidth="xl">
        <Grid
          container
          spacing={8}
          alignItems="center"
          sx={{
            minHeight: '85vh',
            py: 8,
          }}
        >
          {/* LEFT */}
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontSize: { xs: '3rem', md: '5.5rem' },
                fontWeight: 900,
                lineHeight: 1.05,
              }}
            >
              Skip the Wait.
              <br />
              Book Smarter.
              <br />

              <Box
                component="span"
                sx={{
                  opacity: 0.5,
                }}
              >
                Heal Faster.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 4,
                color: 'rgba(255,255,255,0.85)',
                fontSize: '1.2rem',
                lineHeight: 1.8,
                maxWidth: 600,
              }}
            >
              QueueCare connects patients with hospitals in real-time.
              Book appointments, track queues, and manage your health
              effortlessly.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              mt={5}
            >
              <Button
                size="large"
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
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
                }}
              >
                Book an Appointment
              </Button>

              <Button
                size="large"
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{
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
                }}
              >
                View Live Queue
              </Button>
            </Stack>
          </Grid>

          {/* RIGHT STATS */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 6,
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Grid container spacing={3}>
                {[
                  {
                    icon: <CalendarMonthIcon />,
                    value: '12K+',
                    label: 'Appointments Booked',
                  },
                  {
                    icon: <GroupsIcon />,
                    value: '340+',
                    label: 'Hospitals Onboard',
                  },
                  {
                    icon: <EmojiEmotionsIcon />,
                    value: '98%',
                    label: 'Patient Satisfaction',
                  },
                  {
                    icon: <AccessTimeFilledIcon />,
                    value: '~18 min',
                    label: 'Avg. Wait Reduction',
                  },
                ].map((item) => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        textAlign: 'center',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                        }}
                      >
                        {item.icon}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: '2.2rem',
                          fontWeight: 900,
                          mb: 1,
                        }}
                      >
                        {item.value}
                      </Typography>

                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* HOW IT WORKS */}
      <Box
        sx={{
          bgcolor: '#f8f9ff',
          color: '#111827',
          py: 12,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            align="center"
            sx={{
              color: '#6A5AE0',
              fontWeight: 700,
              mb: 2,
              letterSpacing: 1,
            }}
          >
            HOW IT WORKS
          </Typography>

          <Typography
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              mb: 8,
            }}
          >
            Book an appointment in{' '}
            <Box component="span" sx={{ color: '#6A5AE0' }}>
              3 simple steps
            </Box>
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <SearchIcon fontSize="large" />,
                title: 'Find Hospital',
                desc: 'Search hospitals and departments near you.',
                step: '01',
              },
              {
                icon: <EventAvailableIcon fontSize="large" />,
                title: 'Pick a Slot',
                desc: 'Select your preferred time slot instantly.',
                step: '02',
              },
              {
                icon: <CheckCircleIcon fontSize="large" />,
                title: 'Confirm & Track',
                desc: 'Track your queue in real-time.',
                step: '03',
              },
            ].map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 5,
                    borderRadius: 5,
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 4,
                      bgcolor: '#ede9fe',
                      color: '#6A5AE0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 4,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      color: '#6A5AE0',
                      fontWeight: 700,
                      mb: 2,
                    }}
                  >
                    {item.step}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      mb: 2,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#6b7280',
                      lineHeight: 1.8,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FEATURES */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          py: 12,
          color: '#111827',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            align="center"
            sx={{
              color: '#6A5AE0',
              fontWeight: 700,
              mb: 2,
            }}
          >
            FEATURES
          </Typography>

          <Typography
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              mb: 10,
            }}
          >
            Everything you need for a{' '}
            <Box component="span" sx={{ color: '#6A5AE0' }}>
              smarter
            </Box>{' '}
            healthcare experience
          </Typography>

          <Grid container spacing={5}>
            {[
              {
                icon: <AccessTimeIcon />,
                title: 'Real-time Queue Tracking',
                desc: 'Know your queue position in real-time.',
              },
              {
                icon: <NotificationsActiveIcon />,
                title: 'Instant Notifications',
                desc: 'Receive updates and reminders instantly.',
              },
              {
                icon: <SecurityIcon />,
                title: 'Secure & Private',
                desc: 'Industry-level encrypted healthcare data.',
              },
              {
                icon: <DescriptionIcon />,
                title: 'Digital Health Records',
                desc: 'Store prescriptions and reports digitally.',
              },
            ].map((feature) => (
              <Grid item xs={12} md={6} key={feature.title}>
                <Stack direction="row" spacing={3}>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 4,
                      bgcolor: '#ede9fe',
                      color: '#6A5AE0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#6b7280',
                        lineHeight: 1.8,
                      }}
                    >
                      {feature.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;