import { useEffect, useRef } from 'react';

type Props = {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  testId: string;
  wide?: boolean;
  hideTitle?: boolean;
};

/** Accessible modal dialog. Esc closes it when it has an onClose. */
export function Modal({
  title,
  onClose,
  children,
  testId,
  wide,
  hideTitle,
}: Props): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea',
    );
    first?.focus();
    return () => prev?.focus?.();
  }, []);
  return (
    <div className="modal-backdrop" data-testid={`${testId}-backdrop`}>
      <div
        ref={ref}
        className={`modal card${wide ? ' wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid={testId}
      >
        <div className="modal-head">
          <h2 className={hideTitle ? 'sr-only' : ''}>{title}</h2>
          {onClose && (
            <button
              className="ghost close"
              aria-label="Close"
              data-testid={`${testId}-close`}
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
