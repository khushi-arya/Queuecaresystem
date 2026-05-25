import React from 'react';
import { Box } from '@mui/material';
import QueueStatus from '@components/Patient/QueueStatus';

/**
 * PatientLayout Component
 * Wraps patient pages with additional components like QueueStatus
 * Provides consistent layout for all patient-facing pages
 *
 * @example
 * <PatientLayout>
 *   <PatientDashboard />
 * </PatientLayout>
 */
export const PatientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box>
      {/* Queue Status Component - Shows if patient is in queue */}
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2, pt: 2 }}>
        <QueueStatus />
      </Box>

      {/* Main Content */}
      {children}
    </Box>
  );
};

export default PatientLayout;
