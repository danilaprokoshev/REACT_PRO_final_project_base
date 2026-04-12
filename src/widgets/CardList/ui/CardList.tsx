import { memo, useMemo } from 'react';
import { Card } from '../../../shared/ui/Card';
import s from './CardList.module.css';
import { useAppSelector } from '../../../shared/store/utils';
import { cartSelectors } from '../../../shared/store/slices/cart';

type CardListProps = {
	title: string;
	products: Product[];
};
export const CardList = memo(function CardList({
	title,
	products,
}: CardListProps) {
	const cartProducts = useAppSelector(cartSelectors.getCartProducts);
	const cartProductIds = useMemo(() => {
		return new Set(cartProducts.map((p) => p.id));
	}, [cartProducts]);

	const productCards = useMemo(() => {
		return products.map((product) => (
			<Card
				key={product.id}
				product={product}
				isInCart={cartProductIds.has(product.id)}
			/>
		));
	}, [products, cartProductIds]);

	if (!products.length) {
		return <h1 className='header-title'>Товар не найден</h1>;
	}

	return (
		<div className={s['card-list']}>
			<div className={s['card-list__header']}>
				<h2 className={s['card-list__title']}>{title}</h2>
			</div>
			<div className={s['card-list__items']}>{productCards}</div>
		</div>
	);
});
