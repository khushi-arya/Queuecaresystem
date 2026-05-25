import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ConstructionIcon from '@mui/icons-material/Construction';

interface ComingSoonProps {
  featureName: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ featureName }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 10,
          textAlign: 'center',
        }}
      >
        <ConstructionIcon sx={{ fontSize: 100, color: 'primary.main', mb: 4, opacity: 0.8 }} />
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {featureName}
        </Typography>
        
        <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
          We're working hard to bring you this feature. Stay tuned!
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/dashboard')}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ComingSoon;
