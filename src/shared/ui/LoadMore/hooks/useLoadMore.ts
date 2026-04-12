import { RefObject, useCallback, useLayoutEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/utils';
import { useProducts } from '../../../store/hooks/useProducts';
import {
	productsActions,
	productsSelectors,
} from '../../../store/slices/products';

interface UseLoadMoreParams {
	ref: RefObject<HTMLDivElement | null>;
}
export const useLoadMore = ({ ref }: UseLoadMoreParams) => {
	const dispatch = useAppDispatch();

	const { products, isFetching, productsCount } = useProducts();

	const page = useAppSelector(productsSelectors.getPage);

	const isEndOfList = products.length >= productsCount;

	const fetchMoreProducts = useCallback(() => {
		if (!isEndOfList && !isFetching) {
			dispatch(productsActions.setPage(page + 1));
		}
	}, [isEndOfList, isFetching, page, dispatch]);

	useLayoutEffect(() => {
		let observer: IntersectionObserver | undefined = undefined;

		if (!isEndOfList && products.length) {
			const options: IntersectionObserverInit = { threshold: 0.5 };
			const callback: IntersectionObserverCallback = (entries) => {
				if (entries[0].isIntersecting) {
					fetchMoreProducts();
				}
			};
			observer = new IntersectionObserver(callback, options);
			ref.current && observer.observe(ref.current);
		}

		return () => {
			observer?.disconnect();
		};
	}, [fetchMoreProducts, isEndOfList, products.length, ref]);

	return { isEndOfList, isFetching };
};
