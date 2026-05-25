import React from 'react';
import { Skeleton, Stack, Box } from '@mui/material';

interface SkeletonLoaderProps {
  /**
   * Type of skeleton to display
   * - 'row': Single table/list row
   * - 'table': Multiple rows for table
   * - 'card': Card skeleton
   * - 'list': Vertical list items
   * - 'user-card': User profile card with avatar
   * @default 'row'
   */
  variant?: 'row' | 'table' | 'card' | 'list' | 'user-card';

  /**
   * Number of skeleton items to display
   * @default 3
   */
  count?: number;

  /**
   * Height of skeleton element
   * @default '40px'
   */
  height?: string | number;

  /**
   * Width of skeleton element
   * @default '100%'
   */
  width?: string | number;

  /**
   * Animation type
   * @default 'wave'
   */
  animation?: 'pulse' | 'wave' | false;

  /**
   * Custom sx styles
   */
  sx?: any;
}

/**
 * SkeletonLoader Component
 * Displays loading placeholders for better perceived performance
 * Improves UX by showing skeleton instead of blank space
 *
 * @example
 * // Single table row
 * <SkeletonLoader variant="row" count={5} />
 *
 * @example
 * // Card skeleton
 * <SkeletonLoader variant="card" count={3} />
 *
 * @example
 * // User profile card
 * <SkeletonLoader variant="user-card" />
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'row',
  count = 3,
  height = '40px',
  width = '100%',
  animation = 'wave',
  sx = {},
}) => {
  if (variant === 'row') {
    return (
      <Stack spacing={1} sx={sx}>
        {Array.from({ length: count }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            height={height}
            width={width}
            animation={animation}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Stack>
    );
  }

  if (variant === 'table') {
    return (
      <Box sx={sx}>
        {/* Table header skeleton */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rectangular" width="15%" height={40} animation={animation} />
          <Skeleton variant="rectangular" width="20%" height={40} animation={animation} />
          <Skeleton variant="rectangular" width="25%" height={40} animation={animation} />
          <Skeleton variant="rectangular" width="20%" height={40} animation={animation} />
          <Skeleton variant="rectangular" width="20%" height={40} animation={animation} />
        </Box>
        {/* Table rows skeleton */}
        <Stack spacing={1}>
          {Array.from({ length: count }).map((_, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width="15%" height={50} animation={animation} />
              <Skeleton variant="rectangular" width="20%" height={50} animation={animation} />
              <Skeleton variant="rectangular" width="25%" height={50} animation={animation} />
              <Skeleton variant="rectangular" width="20%" height={50} animation={animation} />
              <Skeleton variant="rectangular" width="20%" height={50} animation={animation} />
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Stack spacing={2} sx={sx}>
        {Array.from({ length: count }).map((_, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
            }}
          >
            <Skeleton variant="rectangular" height={20} width="60%" sx={{ mb: 1 }} animation={animation} />
            <Skeleton variant="rectangular" height={16} width="100%" sx={{ mb: 1 }} animation={animation} />
            <Skeleton variant="rectangular" height={16} width="90%" animation={animation} />
          </Box>
        ))}
      </Stack>
    );
  }

  if (variant === 'list') {
    return (
      <Stack spacing={2} sx={sx}>
        {Array.from({ length: count }).map((_, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="circular" width={40} height={40} animation={animation} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={20} width="70%" sx={{ mb: 1 }} animation={animation} />
              <Skeleton variant="rectangular" height={16} width="100%" animation={animation} />
            </Box>
          </Box>
        ))}
      </Stack>
    );
  }

  if (variant === 'user-card') {
    return (
      <Box sx={{ textAlign: 'center', ...sx }}>
        <Skeleton
          variant="circular"
          width={80}
          height={80}
          sx={{ mx: 'auto', mb: 2 }}
          animation={animation}
        />
        <Skeleton variant="rectangular" height={24} width="60%" sx={{ mx: 'auto', mb: 1 }} animation={animation} />
        <Skeleton variant="rectangular" height={16} width="80%" sx={{ mx: 'auto', mb: 2 }} animation={animation} />
        <Skeleton variant="rectangular" height={40} width="100%" animation={animation} />
      </Box>
    );
  }

  return <Skeleton variant="rectangular" height={height} width={width} animation={animation} />;
};

export default SkeletonLoader;
