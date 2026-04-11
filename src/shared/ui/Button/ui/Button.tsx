import { FC, ReactNode } from 'react';
import MuiButton from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { SxProps, Theme } from '@mui/material/styles';

export interface ButtonProps {
	/** MUI button variant */
	variant?: 'text' | 'outlined' | 'contained';
	/** Disabled state */
	disabled?: boolean;
	/** When provided, renders LoadingButton with loading indicator */
	loading?: boolean;
	/** Button content */
	children: ReactNode;
	/** Click handler */
	onClick?: () => void;
	/** HTML button type (useful for forms) */
	type?: 'button' | 'submit' | 'reset';
	/** Stretch to full container width */
	fullWidth?: boolean;
	/** MUI sx prop for custom styles */
	sx?: SxProps<Theme>;
}

export const Button: FC<ButtonProps> = ({
	variant,
	disabled,
	loading,
	children,
	onClick,
	type,
	fullWidth,
	sx,
}) => {
	// If loading prop is provided, use LoadingButton from @mui/lab
	if (loading !== undefined) {
		return (
			<LoadingButton
				variant={variant}
				disabled={disabled}
				loading={loading}
				onClick={onClick}
				type={type}
				fullWidth={fullWidth}
				sx={sx}>
				{children}
			</LoadingButton>
		);
	}

	return (
		<MuiButton
			variant={variant}
			disabled={disabled}
			onClick={onClick}
			type={type}
			fullWidth={fullWidth}
			sx={sx}>
			{children}
		</MuiButton>
	);
};
