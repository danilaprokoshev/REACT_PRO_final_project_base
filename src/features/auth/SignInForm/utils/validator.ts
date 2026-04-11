import * as yup from 'yup';

export const signInFormSchema = yup.object({
	email: yup.string().email().required(),
	password: yup.string().min(6).max(24).required(),
});
