import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  CircularProgress,
  TextField,
  Grid,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { patientAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import SuccessToast from '@components/SuccessToast';

interface PatientProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  allergies?: string;
  currentMedications?: string;
}

export const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfileData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    allergies: '',
    currentMedications: '',
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientProfileData>(profile);

  /**
   * Fetch patient profile
   */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await patientAPI.getProfile();
      const profileData = response.data;

      setProfile({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || user?.email || '',
        phoneNumber: profileData.phoneNumber || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || '',
        bloodType: profileData.bloodType || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipCode: profileData.zipCode || '',
        emergencyContactName: profileData.emergencyContactName || '',
        emergencyContactPhone: profileData.emergencyContactPhone || '',
        medicalConditions: profileData.medicalConditions || '',
        allergies: profileData.allergies || '',
        currentMedications: profileData.currentMedications || '',
      });

      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || user?.email || '',
        phoneNumber: profileData.phoneNumber || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || '',
        bloodType: profileData.bloodType || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipCode: profileData.zipCode || '',
        emergencyContactName: profileData.emergencyContactName || '',
        emergencyContactPhone: profileData.emergencyContactPhone || '',
        medicalConditions: profileData.medicalConditions || '',
        allergies: profileData.allergies || '',
        currentMedications: profileData.currentMedications || '',
      });
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save profile changes
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await patientAPI.updateProfile(formData);

      setProfile(formData);
      setEditing(false);
      setSuccess('Profile updated successfully');

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
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Cancel editing and reset form
   */
  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
    setError(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          My Profile
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage your personal and medical information
        </Typography>
      </Box>

      {/* Success Toast */}
      {success && <SuccessToast message={success} />}

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Profile Card */}
      <Card elevation={2}>
        {/* Header with Edit Button */}
        <CardHeader
          title="Personal Information"
          action={
            !editing ? (
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            ) : null
          }
          sx={{ pb: 2 }}
        />

        <Divider />

        {/* Profile Content */}
        <CardContent>
          <Grid container spacing={3}>
            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                variant="outlined"
                helperText="Email cannot be changed"
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                select
                value={formData.gender}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>

            {/* Blood Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Blood Type"
                name="bloodType"
                select
                value={formData.bloodType}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              >
                <MenuItem value="">Select Blood Type</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
              </TextField>
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>

            {/* State */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>

            {/* Zip Code */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Zip Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>

            {/* Divider for Medical Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Medical Information
              </Typography>
            </Grid>

            {/* Medical Conditions */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Conditions"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
                multiline
                rows={3}
                placeholder="List any chronic or serious medical conditions"
              />
            </Grid>

            {/* Allergies */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
                multiline
                rows={3}
                placeholder="List any known allergies (drugs, food, etc.)"
              />
            </Grid>

            {/* Current Medications */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Medications"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
                multiline
                rows={3}
                placeholder="List any current medications you're taking"
              />
            </Grid>

            {/* Divider for Emergency Contact */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Emergency Contact
              </Typography>
            </Grid>

            {/* Emergency Contact Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>

            {/* Emergency Contact Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                disabled={!editing}
                variant="outlined"
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          {editing && (
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};
