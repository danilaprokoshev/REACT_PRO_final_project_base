import { useState, useActionState } from 'react';
import classNames from 'classnames';
import s from './ReviewForm.module.css';
import { Rating } from '../../../../shared/ui/Rating';

interface ReviewFormState {
	success: boolean;
	message: string;
	resetKey: number;
}

export const ReviewForm = () => {
	const [rating, setRating] = useState(0);

	const [state, submitAction, isPending] = useActionState<
		ReviewFormState,
		FormData
	>(
		async (
			_prevState: ReviewFormState,
			formData: FormData
		): Promise<ReviewFormState> => {
			const text = formData.get('text') as string;

			// Имитация асинхронного запроса к API
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Валидация на сервере (симуляция)
			if (rating === 0) {
				return {
					success: false,
					message: 'Пожалуйста, поставьте оценку',
					resetKey: _prevState.resetKey,
				};
			}

			if (!text || text.trim().length < 5) {
				return {
					success: false,
					message: 'Текст отзыва должен содержать минимум 5 символов',
					resetKey: _prevState.resetKey,
				};
			}

			// Имитация успешной отправки
			console.log('Отправка отзыва:', { text, rating });

			return {
				success: true,
				message: 'Спасибо! Ваш отзыв успешно отправлен.',
				resetKey: _prevState.resetKey + 1,
			};
		},
		{
			success: false,
			message: '',
			resetKey: 0,
		}
	);

	return (
		<form className={s['form']} action={submitAction} key={state.resetKey}>
			<Rating isEdit rating={rating} onChange={setRating} />
			<textarea
				className={classNames(s['input'], s['textarea'])}
				name='text'
				id='text'
				placeholder='Напишите текст отзыва'
				defaultValue=''
				disabled={isPending}></textarea>

			{state.message && (
				<div
					style={{
						margin: '8px 0',
						padding: '10px 16px',
						borderRadius: '8px',
						backgroundColor: state.success ? '#e8f5e9' : '#ffebee',
						color: state.success ? '#2e7d32' : '#c62828',
						fontSize: '14px',
					}}>
					{state.message}
				</div>
			)}

			<button
				type='submit'
				className={classNames(s['form__btn'], s['pramary'])}
				disabled={isPending}
				style={{
					opacity: isPending ? 0.7 : 1,
					cursor: isPending ? 'not-allowed' : 'pointer',
				}}>
				{isPending ? 'Отправка...' : 'Отправить отзыв'}
			</button>
		</form>
	);
};
