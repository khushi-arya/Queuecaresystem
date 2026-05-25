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
  Alert,
  Grid,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { tokenAPI } from '@services/api';
import type { DoctorToken } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';

interface QueueStats {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  missed: number;
  averageWaitTime: number;
  completionRate: number;
  avgConsultationTime: number;
}

interface ChartData {
  name: string;
  value: number;
  percentage: string;
}

interface TimelineData {
  hour: string;
  patients: number;
  completed: number;
}

export const QueueStatistics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    waiting: 0,
    inProgress: 0,
    completed: 0,
    missed: 0,
    averageWaitTime: 0,
    completionRate: 0,
    avgConsultationTime: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  /**
   * Fetch queue statistics
   */
  const fetchStatistics = async (_date: string, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      setError(null);

      if (!user?.id) return;

      // Fetch all tokens for selected date
      const response = await tokenAPI.getQueueTokens(user.id, 0, 100);
      const allTokens: DoctorToken[] = response.data.content || [];

      // Calculate statistics
      const waiting = allTokens.filter((t) => t.status === 'WAITING').length;
      const inProgress = allTokens.filter((t) => t.status === 'IN_CONSULTATION').length;
      const completed = allTokens.filter((t) => t.status === 'COMPLETED').length;
      const missed = allTokens.filter((t) => t.status === 'CANCELLED').length;
      const total = allTokens.length;

      // Calculate average wait time
      let averageWaitTime = 0;
      const completedTokens = allTokens.filter((t) => t.status === 'COMPLETED');
      if (completedTokens.length > 0) {
        const totalWaitTime = completedTokens.reduce((acc, token) => {
          const issuedTime = new Date(token.issuedAt).getTime();
          const calledTime = token.calledAt ? new Date(token.calledAt).getTime() : issuedTime;
          return acc + (calledTime - issuedTime);
        }, 0);
        averageWaitTime = Math.round(totalWaitTime / completedTokens.length / (1000 * 60));
      }

      // Calculate average consultation time
      let avgConsultationTime = 0;
      if (completedTokens.length > 0) {
        const totalConsultationTime = completedTokens.reduce((acc, token) => {
          const calledTime = token.calledAt ? new Date(token.calledAt).getTime() : 0;
          const completedTime = token.completedAt ? new Date(token.completedAt).getTime() : 0;
          return acc + (completedTime - calledTime);
        }, 0);
        avgConsultationTime = Math.round(totalConsultationTime / completedTokens.length / (1000 * 60));
      }

      // Calculate completion rate
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({
        total,
        waiting,
        inProgress,
        completed,
        missed,
        averageWaitTime,
        completionRate,
        avgConsultationTime,
      });

      // Prepare pie chart data
      const pieData: ChartData[] = [
        {
          name: 'Waiting',
          value: waiting,
          percentage: ((waiting / total) * 100).toFixed(1),
        },
        {
          name: 'In Progress',
          value: inProgress,
          percentage: ((inProgress / total) * 100).toFixed(1),
        },
        {
          name: 'Completed',
          value: completed,
          percentage: ((completed / total) * 100).toFixed(1),
        },
        {
          name: 'Missed',
          value: missed,
          percentage: ((missed / total) * 100).toFixed(1),
        },
      ].filter((d) => d.value > 0);

      setChartData(pieData);

      // Prepare timeline data (simulate hourly distribution)
      const hourlyData: Record<string, { patients: number; completed: number }> = {};
      allTokens.forEach((token) => {
        const hour = new Date(token.issuedAt).getHours();
        if (!hourlyData[hour]) {
          hourlyData[hour] = { patients: 0, completed: 0 };
        }
        hourlyData[hour].patients++;
        if (token.status === 'COMPLETED') {
          hourlyData[hour].completed++;
        }
      });

      const timeline = Object.entries(hourlyData)
        .map(([hour, data]) => ({
          hour: `${hour}:00`,
          patients: data.patients,
          completed: data.completed,
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

      setTimelineData(timeline);
    } catch (err: any) {
      console.error('Failed to fetch statistics:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Initialize on mount
   */
  useEffect(() => {
    fetchStatistics(selectedDate);
  }, [user?.id, selectedDate]);

  /**
   * Handle date change
   */
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading statistics...
        </Typography>
      </Container>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Queue Statistics
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => fetchStatistics(selectedDate, true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Total Patients
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Avg Wait Time
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {stats.averageWaitTime}m
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {stats.completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Avg Consultation
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {stats.avgConsultationTime}m
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardHeader title="Status Distribution" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${typeof percent === 'number' ? (percent * 100).toFixed(0) : '0'}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="textSecondary">No data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardHeader title="Quick Stats" />
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Waiting</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats.waiting}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.total > 0 ? (stats.waiting / stats.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">In Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats.inProgress}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}
                    color="info"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats.completed}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                    color="success"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Missed</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats.missed}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.total > 0 ? (stats.missed / stats.total) * 100 : 0}
                    color="error"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Timeline Chart */}
      {timelineData.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Hourly Distribution" />
          <CardContent>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="patients" fill="#3b82f6" name="Total Patients" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Export Option */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          startIcon={<DownloadIcon />}
          variant="outlined"
          onClick={() => {
            const data = {
              date: selectedDate,
              stats,
              exportedAt: new Date().toISOString(),
            };
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `queue-statistics-${selectedDate}.json`;
            a.click();
          }}
        >
          Export as JSON
        </Button>
      </Box>

      {/* Info Box */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Statistics Information:</strong> These metrics help you understand your queue
          performance. Track wait times to identify bottlenecks, monitor completion rates to ensure
          productivity, and adjust schedules based on hourly distribution patterns.
        </Typography>
      </Alert>
    </Container>
  );
};

export default QueueStatistics;
