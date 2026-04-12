import s from './LikeButton.module.css';
import { ReactComponent as LikeSvg } from './../../../assets/icons/like.svg';
import classNames from 'classnames';
import { useEffect, useState, useOptimistic, startTransition } from 'react';
import { useAppSelector } from '../../../store/utils';
import { userSelectors } from '../../../store/slices/user';
import {
	useSetLikeProductMutation,
	useDeleteLikeProductMutation,
	IErrorResponse,
} from '../../../store/api/productsApi';
import { toast } from 'react-toastify';

type TLikeButtonProps = {
	product: Product;
};
export const LikeButton = ({ product }: TLikeButtonProps) => {
	const accessToken = useAppSelector(userSelectors.getAccessToken);
	const user = useAppSelector(userSelectors.getUser);

	const [setLike] = useSetLikeProductMutation();
	const [deleteLike] = useDeleteLikeProductMutation();

	const isLike = product?.likes.some((l) => l.userId === user?.id);
	const [confirmedLike, setConfirmedLike] = useState(isLike);
	const [optimisticLike, setOptimisticLike] = useOptimistic(confirmedLike);

	useEffect(() => {
		setConfirmedLike(isLike);
	}, [isLike]);

	const toggleLike = () => {
		if (!accessToken) {
			toast.warning('Вы не авторизованы');
			return;
		}
		const newLikeState = !optimisticLike;
		startTransition(async () => {
			setOptimisticLike(newLikeState);
			let response;
			if (newLikeState) {
				response = await setLike({ id: `${product.id}` });
			} else {
				response = await deleteLike({ id: `${product.id}` });
			}

			if (response.error) {
				const error = response.error as IErrorResponse;
				toast.error(error.data?.message ?? 'Не удалось изменить лайк');
			} else {
				startTransition(() => {
					setConfirmedLike(newLikeState);
				});
			}
		});
	};

	return (
		<button
			className={classNames(s['card__favorite'], {
				[s['card__favorite_is-active']]: optimisticLike,
			})}
			onClick={toggleLike}>
			<LikeSvg />
		</button>
	);
};
