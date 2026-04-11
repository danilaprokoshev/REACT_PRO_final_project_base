import { WithProtection } from '../../../shared/store/HOCs/WithProtection';
import { SignUpForm } from '../../../features/auth/SignUpForm';

export const SignUpPage = WithProtection(() => {
	return <SignUpForm />;
});
