import { WithProtection } from '../../../shared/store/HOCs/WithProtection';
import { SignInForm } from '../../../features/auth/SignInForm';

export const SignInPage = WithProtection(() => {
	return <SignInForm />;
});
