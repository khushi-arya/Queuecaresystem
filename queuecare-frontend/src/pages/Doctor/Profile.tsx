import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { doctorAPI } from '@services/api';
import type { Doctor } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';
import SuccessToast from '@components/SuccessToast';

interface DoctorProfile {
  specialization: string;
  licenseNumber: string;
  qualifications?: string;
  experience: number;
  hospitalAffiliation?: string;
  workingHours?: string;
  bio?: string;
  isAvailable: boolean;
  averageRating?: number;
  totalReviews?: number;
  // Additional fields for management
  shiftStart?: string;
  shiftEnd?: string;
  breakStart?: string;
  breakEnd?: string;
  maxPatientsPerDay?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
}

export const DoctorProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile>({
    specialization: '',
    licenseNumber: '',
    qualifications: '',
    experience: 0,
    hospitalAffiliation: '',
    workingHours: '',
    bio: '',
    isAvailable: true,
    shiftStart: '09:00',
    shiftEnd: '17:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    maxPatientsPerDay: 50,
    status: 'ACTIVE',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<DoctorProfile>(profile);

  /**
   * Fetch doctor profile
   */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      const response = await doctorAPI.getById(user.id);
      const doctorData = response.data as Doctor;

      setProfile({
        specialization: doctorData.specialization || '',
        licenseNumber: doctorData.licenseNumber || '',
        qualifications: doctorData.qualifications || '',
        experience: doctorData.experience || 0,
        hospitalAffiliation: doctorData.hospitalAffiliation || '',
        workingHours: doctorData.workingHours || '',
        bio: doctorData.bio || '',
        isAvailable: doctorData.isAvailable || true,
        averageRating: doctorData.averageRating,
        totalReviews: doctorData.totalReviews,
      });

      setFormData({
        specialization: doctorData.specialization || '',
        licenseNumber: doctorData.licenseNumber || '',
        qualifications: doctorData.qualifications || '',
        experience: doctorData.experience || 0,
        hospitalAffiliation: doctorData.hospitalAffiliation || '',
        workingHours: doctorData.workingHours || '',
        bio: doctorData.bio || '',
        isAvailable: doctorData.isAvailable || true,
        averageRating: doctorData.averageRating,
        totalReviews: doctorData.totalReviews,
      });
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize on mount
   */
  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  /**
   * Handle input change
   */
  const handleInputChange = (field: keyof DoctorProfile, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!user?.id) return;

      // Validate required fields
      if (!formData.specialization || !formData.licenseNumber) {
        setError('Please fill in all required fields');
        return;
      }

      await doctorAPI.update(user.id, formData);

      setProfile(formData);
      setEditing(false);
      setSuccess('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Doctor Profile
        </Typography>
        <Button
          startIcon={editing ? <CancelIcon /> : <EditIcon />}
          onClick={() => (editing ? handleCancel() : setEditing(true))}
          variant={editing ? 'outlined' : 'contained'}
        >
          {editing ? 'Cancel Edit' : 'Edit Profile'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Success Toast */}
      {success && <SuccessToast message={success} />}

      {/* Basic Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Basic Information" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Name (Read-only) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={user?.firstName || ''}
                disabled
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={user?.lastName || ''}
                disabled
                size="small"
              />
            </Grid>

            {/* Email (Read-only) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={user?.email || ''}
                disabled
                size="small"
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={user?.phone || ''}
                disabled
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Professional Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Professional Information" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Specialization */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialization *"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                disabled={!editing}
                size="small"
              />
            </Grid>

            {/* License Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number *"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                disabled={!editing}
                size="small"
              />
            </Grid>

            {/* Experience */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Years of Experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                disabled={!editing}
                size="small"
              />
            </Grid>

            {/* Hospital Affiliation */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hospital Affiliation"
                value={formData.hospitalAffiliation}
                onChange={(e) => handleInputChange('hospitalAffiliation', e.target.value)}
                disabled={!editing}
                size="small"
              />
            </Grid>

            {/* Qualifications */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Qualifications"
                value={formData.qualifications}
                onChange={(e) => handleInputChange('qualifications', e.target.value)}
                disabled={!editing}
                size="small"
              />
            </Grid>

            {/* Bio */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Professional Bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!editing}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Working Hours Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Working Hours & Availability" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Shift Start */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Shift Start"
                value={formData.shiftStart}
                onChange={(e) => handleInputChange('shiftStart', e.target.value)}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Shift End */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Shift End"
                value={formData.shiftEnd}
                onChange={(e) => handleInputChange('shiftEnd', e.target.value)}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Break Start */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Break Start"
                value={formData.breakStart}
                onChange={(e) => handleInputChange('breakStart', e.target.value)}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Break End */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Break End"
                value={formData.breakEnd}
                onChange={(e) => handleInputChange('breakEnd', e.target.value)}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Max Patients Per Day */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Patients Per Day"
                value={formData.maxPatientsPerDay}
                onChange={(e) => handleInputChange('maxPatientsPerDay', parseInt(e.target.value))}
                disabled={!editing}
                size="small"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" disabled={!editing}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Availability */}
            <Grid item xs={12}>
              <FormControl fullWidth size="small" disabled={!editing}>
                <InputLabel>Available for New Appointments</InputLabel>
                <Select
                  value={formData.isAvailable ? 'true' : 'false'}
                  label="Available for New Appointments"
                  onChange={(e) => handleInputChange('isAvailable', e.target.value === 'true')}
                >
                  <MenuItem value="true">Available</MenuItem>
                  <MenuItem value="false">Not Available</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Performance Card (Read-only) */}
      {(profile.averageRating || profile.totalReviews) && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Performance Metrics" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Average Rating
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {profile.averageRating || 'N/A'} / 5.0
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Total Reviews
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {profile.totalReviews || 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {editing && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            startIcon={<CancelIcon />}
            variant="outlined"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default DoctorProfile;
