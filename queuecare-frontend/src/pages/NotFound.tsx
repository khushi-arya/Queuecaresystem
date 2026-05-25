import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * NotFound Component (404 Page)
 * Displays when user navigates to non-existent route
 */
export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: 'error.main',
              mb: 3,
            }}
            aria-label="Error icon"
          />

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              fontSize: { xs: '3rem', md: '4rem' },
            }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              fontWeight: 500,
            }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            We couldn't find the page you're looking for. It might have been moved or deleted. Let's get you back on track.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate(-1)}
              aria-label="Go back to previous page"
            >
              Go Back
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/dashboard')}
              aria-label="Go to dashboard"
            >
              Dashboard
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              aria-label="Go to login page"
            >
              Login
            </Button>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 6,
              color: 'text.disabled',
            }}
          >
            If you believe this is an error, please contact support.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;
