import { Link } from 'react-router-dom';
import s from './NotFoudPage.module.css';

export const NotFoundPage = () => {
	return (
		<div className={s['not-found-page']}>
			<h1>Страница на найдена</h1>
			<Link to='/'>
				<button>Перейти на главную</button>
			</Link>
		</div>
	);
};
