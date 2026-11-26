import React from 'react';

interface PopupProps {
  children: React.ReactNode;
  labelledBy: string;
  onClose: () => void;
}

function Popup({ children, labelledBy, onClose }: PopupProps) {
  return (
    <div
      className="popup-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="popup" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </section>
    </div>
  );
}

export default Popup;
