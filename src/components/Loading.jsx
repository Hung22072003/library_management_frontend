import React from 'react';

const Loading = ({
    size = 'medium',
    color = 'primary',
    text = 'Loading...',
    type = 'circle', // Thêm prop type để chọn kiểu spinner
}) => {
    // Xác định màu sắc dựa trên prop color
    const colors = {
        primary: 'blue-500',
        secondary: 'gray-500',
        success: 'green-500',
        danger: 'red-500',
        warning: 'yellow-500',
        info: 'purple-500',
    };

    const selectedColor = colors[color] || colors.primary;

    // Xác định kích thước dựa trên prop size
    const sizes = {
        small: {
            circle: 'w-4 h-4 border-2',
            dots: 'w-1 h-1 mx-1',
            bars: 'w-1 h-4 mx-1',
            pulse: 'w-4 h-4',
            spinner: 'w-4 h-4',
        },
        medium: {
            circle: 'w-8 h-8 border-3',
            dots: 'w-2 h-2 mx-1',
            bars: 'w-2 h-8 mx-1',
            pulse: 'w-8 h-8',
            spinner: 'w-8 h-8',
        },
        large: {
            circle: 'w-12 h-12 border-4',
            dots: 'w-3 h-3 mx-2',
            bars: 'w-2 h-12 mx-2',
            pulse: 'w-12 h-12',
            spinner: 'w-12 h-12',
        },
        xlarge: {
            circle: 'w-16 h-16 border-4',
            dots: 'w-4 h-4 mx-2',
            bars: 'w-3 h-16 mx-2',
            pulse: 'w-16 h-16',
            spinner: 'w-16 h-16',
        },
    };

    const selectedSize = sizes[size] || sizes.medium;

    // Render based on spinner type
    const renderSpinner = () => {
        switch (type) {
            case 'circle':
                return (
                    <div
                        className={`${selectedSize.circle} animate-spin rounded-full border border-solid border-t-transparent border-${selectedColor}`}
                    ></div>
                );

            case 'dots':
                return (
                    <div className="flex items-center">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`${selectedSize.dots} rounded-full bg-${selectedColor} animate-bounce`}
                                style={{ animationDelay: `${i * 0.15}s` }}
                            ></div>
                        ))}
                    </div>
                );

            case 'bars':
                return (
                    <div className="flex items-end">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`${selectedSize.bars} bg-${selectedColor} animate-pulse rounded-full`}
                                style={{ animationDelay: `${i * 0.15}s` }}
                            ></div>
                        ))}
                    </div>
                );

            case 'pulse':
                return (
                    <div
                        className={`${selectedSize.pulse} border-4 border-${selectedColor} animate-pulse rounded-full`}
                    ></div>
                );

            case 'spinner':
                return (
                    <div className={`${selectedSize.spinner} animate-spin`}>
                        <svg
                            className="h-full w-full"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                                stroke={`currentColor`}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className={`text-${selectedColor} opacity-20`}
                            />
                            <path
                                d="M12 2C6.47715 2 2 6.47715 2 12"
                                stroke={`currentColor`}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className={`text-${selectedColor}`}
                            />
                        </svg>
                    </div>
                );

            default:
                return (
                    <div
                        className={`${selectedSize.circle} animate-spin rounded-full border border-solid border-t-transparent border-${selectedColor}`}
                    ></div>
                );
        }
    };

    return <div className="flex flex-col items-center justify-center p-4">{renderSpinner()}</div>;
};

// Overlay Loading - để hiển thị trên toàn màn hình
export const LoadingOverlay = ({
    size = 'large',
    color = 'primary',
    text = 'Loading...',
    type = 'circle',
    bgOpacity = 75,
}) => {
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-${bgOpacity}`}>
            <Loading size={size} color={color} text={text} type={type} />
        </div>
    );
};

export default Loading;
