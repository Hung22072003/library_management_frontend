import background from '../assets/background.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faShieldAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { notification } from 'antd';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../services/authService';

// Schema validation cho OTP
const schemaVerifyOTP = yup.object({
    otp: yup
        .string()
        .required('OTP is required')
        .length(6, 'OTP must be exactly 6 digits')
        .matches(/^\d+$/, 'OTP must contain only numbers'),
});

function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [resendEndTime, setResendEndTime] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schemaVerifyOTP),
    });

    const [errorMessages, setErrorMessages] = useState({ otp: '' });

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password/request-otp');
        }
    }, [email, navigate]);

    useEffect(() => {
        setErrorMessages({
            otp: errors.otp?.message ?? '',
        });
    }, [errors.otp]);

    useEffect(() => {
        let intervalId;

        const updateCountdown = () => {
            if (resendEndTime) {
                const now = Date.now();
                const timeLeft = Math.max(0, Math.ceil((resendEndTime - now) / 1000));
                setCountdown(timeLeft);

                if (timeLeft === 0) {
                    setResendEndTime(null);
                }
            }
        };

        if (resendEndTime) {
            // Update immediately
            updateCountdown();
            // Then update every second
            intervalId = setInterval(updateCountdown, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [resendEndTime]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await verifyOtp(email, data.otp);
            if (response) {
                notification.open({
                    type: 'success',
                    message: 'Success',
                    description: response.data.message || 'OTP verified successfully',
                    duration: 2,
                });
                navigate('/forgot-password/reset', { state: { email: email, otp: data.otp } });
            }
        } catch (error) {
            notification.open({
                type: 'error',
                message: 'Error',
                description: error?.data?.message || 'Network error. Please try again.',
                duration: 2,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        try {
            const response = await requestOtp(email);
            if (response) {
                notification.open({
                    type: 'success',
                    message: 'Success',
                    description: 'OTP has been sent to your email',
                    duration: 2,
                });
                setResendEndTime(Date.now() + 60000);
            }
        } catch (error) {
            console.log('Error resending OTP:', error);
            notification.open({
                type: 'error',
                message: 'Error',
                description: error?.data?.message || 'Failed to send OTP. Please try again.',
                duration: 2,
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex flex-col items-center bg-[#F6F8FF] lg:flex-row">
            <div className="relative hidden h-screen w-[50%] lg:block">
                <img src={background} alt="#" className="h-screen w-full" />
            </div>

            <div className="flex w-[100%] flex-1 flex-col px-[24px] sm:w-[70%] lg:w-[50%] lg:px-[50px] xl:px-[100px] 2xl:px-[150px]">
                <div className="rounded-[8px] border-[1px] border-[#E5E7EB] bg-white p-[32px] shadow-[4px_4px_30px_4px_rgba(0,0,0,0.1)]">
                    {/* Back button */}
                    <div className="mb-[20px]">
                        <button
                            onClick={() => navigate('/forgot-password/request-otp')}
                            className="flex cursor-pointer items-center text-[#1B326D] hover:font-bold hover:text-[#22316C]"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            <span className="text-[14px] font-medium">Back</span>
                        </button>
                    </div>

                    <div className="mb-[12px] flex items-center justify-center">
                        <FontAwesomeIcon icon={faShieldAlt} size={'2xl'} className="text-[#22316C]" />
                    </div>
                    <h1 className="mb-[3px] text-center text-[30px] font-bold text-[#1B326D]">Verify OTP</h1>
                    <p className="mb-[32px] text-center text-[14px] text-[#22316C]">
                        We've sent a 6-digit code to <strong>{email}</strong>. Enter the code below to continue.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-[24px]">
                            <label htmlFor="otp" className="mb-[4px] block text-[14px] font-medium text-[#22316C]">
                                OTP Code
                            </label>
                            <input
                                className="w-full rounded-[8px] border-[1px] border-[#1B326D] p-[12px_24px] text-center text-[18px] font-medium tracking-[8px] text-[#22316C] outline-none"
                                type="text"
                                id="otp"
                                autoFocus
                                placeholder="000000"
                                maxLength="6"
                                {...register('otp')}
                            />
                            <p className="mt-1 text-sm text-red-500">{errorMessages.otp}</p>
                        </div>

                        <div className="mb-[24px]">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full cursor-pointer rounded-[8px] border-[1px] border-[#1B326D] bg-[#1B326D] p-[11px_24px] text-center text-[14px] font-medium text-white hover:opacity-[0.9] disabled:cursor-not-allowed disabled:opacity-[0.6]"
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="mb-[16px] text-[14px] text-[#22316C]">Didn't receive the code?</p>
                        <button
                            onClick={handleResendOTP}
                            disabled={isResending || countdown > 0}
                            className="text-[14px] font-medium text-[#1B326D] hover:cursor-pointer hover:font-bold disabled:cursor-not-allowed disabled:opacity-[0.6]"
                        >
                            {isResending ? 'Resending...' : countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyOtp;
