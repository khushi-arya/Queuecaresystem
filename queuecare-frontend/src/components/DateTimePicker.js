import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
/**
 * DateTimePicker Component
 * Wrapper around MUI TextField for date/time input with React Hook Form support
 *
 * @example
 * // Basic date picker
 * <DateTimePicker
 *   type="date"
 *   label="Appointment Date"
 *   value={date}
 *   onChange={(e) => setDate(e.target.value)}
 * />
 *
 * @example
 * // With React Hook Form
 * const { control } = useForm();
 * <DateTimePicker
 *   control={control}
 *   name="appointmentDate"
 *   type="datetime-local"
 *   label="Appointment Date & Time"
 * />
 *
 * @example
 * // Time picker with limits
 * <DateTimePicker
 *   type="time"
 *   label="Appointment Time"
 *   min="08:00"
 *   max="17:00"
 *   showSeconds={false}
 * />
 */
export const DateTimePicker = React.forwardRef(({ control, name, value, onChange, type = 'datetime-local', min, max, showSeconds = false, label, required, error, helperText, disabled, ...rest }) => {
    const getStep = () => {
        if (type === 'time') {
            return showSeconds ? '1' : '60';
        }
        return undefined;
    };
    // Props object prepared but spread directly in TextField components
    // const textFieldProps = {
    //   ref,
    //   type,
    //   label,
    //   required,
    //   error,
    //   helperText,
    //   disabled,
    //   inputProps: {
    //     min,
    //     max,
    //     step: getStep(),
    //   },
    //   InputLabelProps: {
    //     shrink: true,
    //   },
    //   variant: 'outlined' as const,
    //   fullWidth: true,
    //   ...rest,
    // };
    // If using React Hook Form
    if (control && name) {
        return (_jsx(Controller, { name: name, control: control, render: ({ field: { value: fieldValue, onChange: fieldOnChange } }) => (_jsx(TextField, { type: type, label: label, required: required, error: error, helperText: helperText, disabled: disabled, value: fieldValue || '', onChange: (e) => fieldOnChange(e.target.value), inputProps: {
                    min,
                    max,
                    step: getStep(),
                }, InputLabelProps: {
                    shrink: true,
                }, variant: "outlined", fullWidth: true, ...rest })) }));
    }
    // Standalone component
    return (_jsx(TextField, { type: type, label: label, required: required, error: error, helperText: helperText, disabled: disabled, value: value || '', onChange: (e) => onChange?.(e.target.value), inputProps: {
            min,
            max,
            step: getStep(),
        }, InputLabelProps: {
            shrink: true,
        }, variant: "outlined", fullWidth: true, ...rest }));
});
DateTimePicker.displayName = 'DateTimePicker';
export default DateTimePicker;
