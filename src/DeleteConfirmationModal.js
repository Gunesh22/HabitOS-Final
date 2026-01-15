import React from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div
                className="modal-content"
                style={{ maxWidth: '400px', textAlign: 'center' }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ marginBottom: '20px', color: '#fff' }}>{title}</h3>
                <p style={{ marginBottom: '30px', opacity: 0.7, color: '#fff' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        className="fancy-button"
                        style={{
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            background: 'transparent'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="fancy-button"
                        style={{
                            borderColor: '#ff4444',
                            color: '#ff4444',
                            background: 'rgba(255,68,68,0.1)'
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
