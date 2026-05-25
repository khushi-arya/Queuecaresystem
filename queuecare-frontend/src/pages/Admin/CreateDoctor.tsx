import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import apiClient from '@services/api';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional().or(z.literal('')),

  // Doctor fields
  name: z.string().min(2, 'Name is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  shiftStartTime: z.string().min(1, 'Shift start time is required'),
  shiftEndTime: z.string().min(1, 'Shift end time is required'),
  maxPatientsPerDay: z
    .number()
    .min(1)
    .max(100)
    .or(z.string().transform((s) => Number(s))),
  bio: z.string().optional().or(z.literal('')),
  experience: z.number().optional().or(z.string().transform((s) => (s ? Number(s) : undefined))),
  hospitalAffiliation: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export const CreateDoctor: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      bio: '',
      experience: undefined,
      hospitalAffiliation: '',
    } as any,
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);

    try {
      // Create user as DOCTOR without altering current admin session
      const registerResp = await apiClient.post('/api/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'DOCTOR',
        phone: data.phone || undefined,
      });

      const userId = registerResp?.data?.user?.id;

      if (!userId) {
        throw new Error('Failed to create user for doctor');
      }

      // Prepare doctor payload (backend expects LocalTime strings like "08:00")
      const doctorPayload = {
        name: data.name,
        specialization: data.specialization,
        shiftStartTime: data.shiftStartTime,
        shiftEndTime: data.shiftEndTime,
        maxPatientsPerDay: Number(data.maxPatientsPerDay),
        bio: data.bio || undefined,
        experience: data.experience ? Number(data.experience) : undefined,
        hospitalAffiliation: data.hospitalAffiliation || undefined,
      };

      await apiClient.post(`/api/doctors/${userId}`, doctorPayload);

      navigate('/admin/doctors');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create doctor';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }} elevation={3}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Create Doctor
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              User Account
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" fullWidth {...register('email')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Password" type="password" fullWidth {...register('password')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="First Name" fullWidth {...register('firstName')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Name" fullWidth {...register('lastName')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone (optional)" fullWidth {...register('phone')} />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              Doctor Profile
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <TextField label="Doctor Full Name" fullWidth {...register('name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Specialization" fullWidth {...register('specialization')} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Shift Start (HH:mm)" fullWidth {...register('shiftStartTime')} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label="Shift End (HH:mm)" fullWidth {...register('shiftEndTime')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Max Patients/Day" type="number" fullWidth {...register('maxPatientsPerDay' as any)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Experience (years)" type="number" fullWidth {...register('experience' as any)} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Hospital Affiliation" fullWidth {...register('hospitalAffiliation')} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Bio" multiline rows={4} fullWidth {...register('bio')} />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/admin/doctors')} disabled={loading}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Doctor'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateDoctor;
