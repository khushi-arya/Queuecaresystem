import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Doctor } from '../../types/api';
import { doctorAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import PaginationControls from '@components/PaginationControls';

/**
 * ViewDoctors Page
 * Browse and search for available doctors
 * Route: /patient/doctors
 *
 * Features:
 * - Display doctor cards with details
 * - Filter by specialization and status
 * - View doctor details in modal
 * - Pagination controls
 */
export const ViewDoctors: React.FC = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const isFirstRender = useRef(true);

  // Filters
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);

  // Detail Modal
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  /**
   * Fetch doctors
   */
  const fetchDoctors = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pageNum - 1,
        size: pageSize,
      };

      if (specializationFilter) {
        params.specialization = specializationFilter;
      }

      if (availabilityFilter) {
        params.isAvailable = availabilityFilter === 'available';
      }

      const response = await doctorAPI.getAll(
        params.page,
        params.size,
        params.specialization,
        params.isAvailable
      );
      
      const data = response.data;
      const doctorsList = Array.isArray(data) ? data : (data?.content || []);
      const totalPgs = Array.isArray(data) ? 1 : (data?.totalPages || 1);
      const totalItms = Array.isArray(data) ? data.length : (data?.totalElements || 0);

      setDoctors(doctorsList);
      setTotalPages(totalPgs);
      setTotalItems(totalItms);

      // Extract unique specializations
      if (pageNum === 1) {
        const allResponse = await doctorAPI.getAll(0, 100);
        const allData = allResponse.data;
        const allDoctors = Array.isArray(allData) ? allData : (allData?.content || []);
        const specs = Array.from(
          new Set(allDoctors.map((d: any) => d.specialization).filter(Boolean))
        ) as string[];
        setSpecializations(specs.sort());
      }
    } catch (err: any) {
      console.error('Failed to fetch doctors:', err);
      setError(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load doctors on mount
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchDoctors(page);
  }, [page, pageSize]);

  // Load on filter change - reset to page 1
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchDoctors(1);
    }
  }, [specializationFilter, availabilityFilter]);

  /**
   * Open doctor detail modal
   */
  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setDetailDialogOpen(true);
  };

  /**
   * Close doctor detail modal
   */
  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedDoctor(null);
  };

  /**
   * Navigate to booking page with selected doctor
   */
  const handleBookAppointment = (doctorId: string | number) => {
    navigate('/patient/book-appointment', { state: { selectedDoctorId: String(doctorId) } });
    handleCloseDetail();
  };

  if (loading && page === 1) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Find a Doctor
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Search and book appointments with our experienced doctors
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Filters Card */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardHeader
          title="Filters"
          titleTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
        />
        <CardContent>
          <Grid container spacing={2}>
            {/* Specialization Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Specialization</InputLabel>
                <Select
                  value={specializationFilter}
                  label="Specialization"
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                  <MenuItem value="">All Specializations</MenuItem>
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Availability Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={availabilityFilter}
                  label="Availability"
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="unavailable">Not Available</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Clear Filters */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSpecializationFilter('');
                  setAvailabilityFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="info">No doctors found matching your criteria</Alert>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {doctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: doctor.status === 'ACTIVE' ? 'success.main' : 'error.main',
                        width: 56,
                        height: 56,
                        fontSize: '1.5rem',
                      }}
                    >
                      {(doctor.name || String(doctor.userId)).charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={`Dr. ${doctor.name || doctor.userId}`}
                  subheader={doctor.specialization}
                  action={
                    <Chip
                      label={doctor.status === 'ACTIVE' ? 'Available' : 'Not Available'}
                      color={doctor.status === 'ACTIVE' ? 'success' : 'error'}
                      size="small"
                    />
                  }
                  titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
                />

                <CardContent sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    {/* Experience */}
                    {doctor.experience !== undefined && doctor.experience > 0 && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SchoolIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {doctor.experience} years experience
                        </Typography>
                      </Stack>
                    )}

                    {/* Rating placeholder since it's not in current schema */}
                    {doctor.averageRating && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={doctor.averageRating} readOnly size="small" />
                        <Typography variant="body2" color="textSecondary">
                          {doctor.averageRating.toFixed(1)}/5.0 ({doctor.totalReviews || 0} reviews)
                        </Typography>
                      </Stack>
                    )}

                    {/* Hospital */}
                    {doctor.hospitalAffiliation && (
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <LocationOnIcon
                          sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5 }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {doctor.hospitalAffiliation}
                        </Typography>
                      </Stack>
                    )}

                    {/* Bio */}
                    {doctor.bio && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {doctor.bio}
                      </Typography>
                    )}

                    {/* Working Hours derived from shift times */}
                    {(doctor.shiftStartTime || doctor.shiftEndTime) && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        <strong>Hours:</strong> {doctor.shiftStartTime || 'N/A'} - {doctor.shiftEndTime || 'N/A'}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>

                <Divider />

                {/* Actions */}
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleViewDetails(doctor)}
                  >
                    View Profile
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleBookAppointment(doctor.id)}
                  >
                    Book Now
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[12, 24, 36]}
          />
        </Box>
      )}

      {/* Doctor Detail Modal */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Doctor Profile
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedDoctor && (
            <Stack spacing={3}>
              {/* Header */}
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar
                  sx={{
                    bgcolor: selectedDoctor.status === 'ACTIVE' ? 'success.main' : 'error.main',
                    width: 64,
                    height: 64,
                    fontSize: '2rem',
                  }}
                >
                  {(selectedDoctor.name || String(selectedDoctor.userId)).charAt(0).toUpperCase()}
                </Avatar>
                <Stack spacing={0.5} sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Dr. {selectedDoctor.name || selectedDoctor.userId}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedDoctor.specialization}
                  </Typography>
                  <Chip
                    label={selectedDoctor.status === 'ACTIVE' ? 'Available' : 'Not Available'}
                    color={selectedDoctor.status === 'ACTIVE' ? 'success' : 'error'}
                    size="small"
                    sx={{ width: 'fit-content' }}
                  />
                </Stack>
              </Stack>

              <Divider />

              {/* Details */}
              <Stack spacing={1.5}>
                {/* Experience */}
                {(selectedDoctor as any).experience > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Experience
                    </Typography>
                    <Typography variant="body2">{(selectedDoctor as any).experience} years</Typography>
                  </Box>
                )}

                {/* Rating */}
                {(selectedDoctor as any).averageRating && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Rating
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Rating value={(selectedDoctor as any).averageRating} readOnly size="small" />
                      <Typography variant="body2">
                        {(selectedDoctor as any).averageRating.toFixed(1)}/5.0 (
                        {(selectedDoctor as any).totalReviews || 0} reviews)
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* License Number */}
                {(selectedDoctor as any).licenseNumber && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      License Number
                    </Typography>
                    <Typography variant="body2">{(selectedDoctor as any).licenseNumber}</Typography>
                  </Box>
                )}

                {/* Hospital */}
                {(selectedDoctor as any).hospitalAffiliation && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Hospital Affiliation
                    </Typography>
                    <Typography variant="body2">
                      {(selectedDoctor as any).hospitalAffiliation}
                    </Typography>
                  </Box>
                )}

                {/* Working Hours derived from shift times */}
                {(selectedDoctor.shiftStartTime || selectedDoctor.shiftEndTime) && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Working Hours
                    </Typography>
                    <Typography variant="body2">
                      {selectedDoctor.shiftStartTime || 'N/A'} - {selectedDoctor.shiftEndTime || 'N/A'}
                    </Typography>
                  </Box>
                )}

                {/* Qualifications */}
                {(selectedDoctor as any).qualifications && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Qualifications
                    </Typography>
                    <Typography variant="body2">{(selectedDoctor as any).qualifications}</Typography>
                  </Box>
                )}

                {/* Bio */}
                {(selectedDoctor as any).bio && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Bio
                    </Typography>
                    <Typography variant="body2">{(selectedDoctor as any).bio}</Typography>
                  </Box>
                )}
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDetail} variant="outlined">
            Close
          </Button>
          {selectedDoctor && (
            <Button
              onClick={() => handleBookAppointment(selectedDoctor.id)}
              variant="contained"
              color="primary"
            >
              Book Now
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewDoctors;
