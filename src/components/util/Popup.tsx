"use client";
import React, { ReactNode, useRef } from 'react';
// Import CSSTransition
import { CSSTransition } from 'react-transition-group';
import "./popup.module.css"

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    onCloseVisible?: boolean; // Default to true if not provided? Consider adding a default prop.
    title?: string;
    children: ReactNode;
    animationTimeout?: number; // Optional: Allow customizing animation duration
}

const Popup: React.FC<PopupProps> = ({
    isOpen,
    onClose,
    onCloseVisible = true, // Provide a default value
    title,
    children,
    animationTimeout = 300 // Default animation duration in ms
}) => {
    // Create a ref for the node being transitioned
    const nodeRef = useRef(null);

    // We remove the `if (!isOpen) return null;` because CSSTransition
    // handles mounting and unmounting based on the `in` prop and `unmountOnExit`.

    return (
        // CSSTransition manages the mounting/unmounting and adding/removing classes
        <CSSTransition
            in={isOpen} // Controls the transition state
            timeout={animationTimeout} // Duration of the animation in ms (should match CSS)
            classNames="popup-transition" // Prefix for CSS classes (e.g., popup-transition-enter, popup-transition-exit-active)
            unmountOnExit // Remove the component from the DOM when exited
            nodeRef={nodeRef} // Pass the ref to CSSTransition
        >
            {/* This outer div is the overlay/backdrop */}
            <div
                ref={nodeRef} // Attach the ref to the element being transitioned
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] popup-overlay"
                // Close on overlay click
                onClick={onClose}
                // Add role and aria-modal for accessibility
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "popup-title" : undefined} // Reference title if exists
            >
                {/* This inner div is the actual popup content box */}
                <div
                    className="bg-white p-5 rounded-lg max-w-[500px] w-[90%] shadow-md relative popup-content"
                    // Prevent closing when clicking inside the content
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Add id for aria-labelledby */}
                    {title && <h2 id="popup-title" className="m-0 mb-2.5 text-xl">{title}</h2>}
                    {
                        onCloseVisible && (
                            <button
                                className="absolute top-2.5 right-2.5 bg-none border-none text-xl cursor-pointer text-gray-500 hover:text-gray-800"
                                onClick={onClose}
                                aria-label="Close popup" // Accessibility improvement
                            >
                                ×
                            </button>
                        )
                    }
                    <div className="mt-2.5">{children}</div>
                </div>
            </div>
        </CSSTransition>
    );
};

export default Popup;