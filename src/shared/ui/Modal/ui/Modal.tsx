import { useEffect, useRef, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import s from './Modal.module.css';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: string;
}

export const Modal: FC<ModalProps> = ({ isOpen, ...restProps }) => {
	const modalRoot = document.getElementById('modal-root');
	if (!modalRoot) return null;

	return createPortal(
		<div className={`${s.overlay} ${isOpen ? s.overlayOpen : ''}`}>
			<ModalInner {...restProps} isOpen={isOpen} />
		</div>,
		modalRoot
	);
};

const ModalInner: FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const triggerRef = useRef<Element | null>(null);

	// Запоминание триггера + начальный фокус на крестик
	useEffect(() => {
		if (isOpen) {
			// Запоминаем элемент, который был в фокусе до открытия модалки
			triggerRef.current = document.activeElement;
			// Устанавливаем фокус после отрисовки (элемент должен стать visible)
			const frameId = requestAnimationFrame(() => {
				closeButtonRef.current?.focus();
			});

			return () => cancelAnimationFrame(frameId);
		} else if (triggerRef.current) {
			// При закрытии возвращаем фокус на триггер
			(triggerRef.current as HTMLElement).focus?.();
			triggerRef.current = null;
		}
	}, [isOpen]);

	// Scroll lock: блокировка прокрутки страницы при открытой модалке
	useEffect(() => {
		if (isOpen) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';

			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	}, [isOpen]);

	// Закрытие по клику вне модалки (overlay)
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Закрытие по Escape + Tab trap
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') {
				onClose();
				return;
			}

			// Tab trap: зацикливаем фокус внутри модалки
			if (event.key === 'Tab' && containerRef.current) {
				const focusableElements =
					containerRef.current.querySelectorAll<HTMLElement>(
						'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
					);

				if (focusableElements.length === 0) return;

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];

				if (event.shiftKey) {
					// Shift+Tab: если фокус на первом элементе — перейти на последний
					if (document.activeElement === firstElement) {
						event.preventDefault();
						lastElement.focus();
					}
				} else {
					// Tab: если фокус на последнем элементе — перейти на первый
					if (document.activeElement === lastElement) {
						event.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleKeyDown);
		}

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	return (
		<div
			ref={containerRef}
			className={`${s.container} ${isOpen ? s.containerOpen : ''}`}
			role='dialog'
			aria-modal='true'
			aria-label={title || 'Модальное окно'}>
			<div className={s.header}>
				{title && <span className={s.title}>{title}</span>}
				<IconButton
					ref={closeButtonRef}
					className={s.closeButton}
					onClick={onClose}
					aria-label='Закрыть'
					size='small'>
					<CloseIcon />
				</IconButton>
			</div>
			<div className={s.body}>{children}</div>
		</div>
	);
};
