import s from './LikeButton.module.css';
import { ReactComponent as LikeSvg } from './../../../assets/icons/like.svg';
import classNames from 'classnames';
import { useAppSelector } from '../../../store/utils';
import { userSelectors } from '../../../store/slices/user';
import {
	useSetLikeProductMutation,
	useDeleteLikeProductMutation,
	IErrorResponse,
} from '../../../store/api/productsApi';
import { toast } from 'react-toastify';
import { useOptimistic } from 'react';

type TLikeButtonProps = {
	product: Product;
};
export const LikeButton = ({ product }: TLikeButtonProps) => {
	const accessToken = useAppSelector(userSelectors.getAccessToken);
	const user = useAppSelector(userSelectors.getUser);

	const [setLike] = useSetLikeProductMutation();
	const [deleteLike] = useDeleteLikeProductMutation();

	const isLike = product?.likes.some((l) => l.userId === user?.id);
	const [optimisticLike, setOptimisticLike] = useOptimistic(isLike);

	const toggleLike = async () => {
		if (!accessToken) {
			toast.warning('Вы не авторизованы');
			return;
		}
		const newLikeState = !isLike;
		setOptimisticLike(newLikeState);
		let response;
		if (newLikeState) {
			response = await setLike({ id: `${product.id}` });
		} else {
			response = await deleteLike({ id: `${product.id}` });
		}

		if (response.error) {
			setOptimisticLike(isLike);
			const error = response.error as IErrorResponse;
			toast.error(error.data.message);
		}
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
