import { FC, Ref } from 'react';
import TextField from '@mui/material/TextField';

export interface InputProps {
	/** Field label */
	label?: string;
	/** HTML input type (text, email, password, etc.) */
	type?: string;
	/** Whether the field has a validation error */
	error?: boolean;
	/** Validation error message or helper text */
	helperText?: string;
	/** Stretch to full container width */
	fullWidth?: boolean;
	/** Mark field as required */
	required?: boolean;
	/** MUI margin prop */
	margin?: 'none' | 'dense' | 'normal';
	/** HTML autocomplete attribute */
	autoComplete?: string;
	/** Ref forwarded to the underlying input element (for useRef / react-hook-form) */
	inputRef?: Ref<HTMLInputElement>;
	/** Field name (from react-hook-form field spread) */
	name?: string;
	/** Field value (from react-hook-form field spread) */
	value?: string;
	/** Change handler (from react-hook-form field spread) */
	onChange?: (...event: unknown[]) => void;
	/** Blur handler (from react-hook-form field spread) */
	onBlur?: () => void;
}

export const Input: FC<InputProps> = ({
	label,
	type,
	error,
	helperText,
	fullWidth,
	required,
	margin,
	autoComplete,
	inputRef,
	...rest
}) => {
	return (
		<TextField
			label={label}
			type={type}
			error={error}
			helperText={helperText}
			fullWidth={fullWidth}
			required={required}
			margin={margin}
			autoComplete={autoComplete}
			inputRef={inputRef}
			{...rest}
		/>
	);
};
