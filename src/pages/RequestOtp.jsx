import background from '../assets/background.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { notification } from 'antd';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { requestOtp } from '../services/authService';

// Schema validation cho email
const schemaForgotPassword = yup.object({
    email: yup.string().required('Email is required').email('Please enter a valid email address'),
});

function RequestOtp() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schemaForgotPassword),
    });

    const [errorMessages, setErrorMessages] = useState({ email: '' });

    useEffect(() => {
        setErrorMessages({
            email: errors.email?.message ?? '',
        });
    }, [errors.email]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await requestOtp(data.email);
            if (response) {
                notification.open({
                    type: 'success',
                    message: 'Success',
                    description: 'OTP has been sent to your email',
                    duration: 2,
                });
                navigate('/forgot-password/verify-otp', { state: { email: data.email } });
            }
        } catch (error) {
            notification.open({
                type: 'error',
                message: 'Error',
                description: error?.data?.message || 'Failed to send OTP. Please try again.',
                duration: 2,
            });
        } finally {
            setIsLoading(false);
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
                            onClick={() => navigate('/login')}
                            className="flex cursor-pointer items-center text-[#1B326D] hover:font-bold hover:text-[#22316C]"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            <span className="text-[14px] font-medium">Back to Login</span>
                        </button>
                    </div>

                    <div className="mb-[12px] flex items-center justify-center">
                        <FontAwesomeIcon icon={faBookOpen} size={'2xl'} className="text-[#22316C]" />
                    </div>
                    <h1 className="mb-[3px] text-center text-[30px] font-bold text-[#1B326D]">Forgot Password</h1>
                    <p className="mb-[32px] text-center text-[14px] text-[#22316C]">
                        Enter your email address and we'll send you an OTP to reset your password
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-[24px]">
                            <label htmlFor="email" className="mb-[4px] block text-[14px] font-medium text-[#22316C]">
                                Email address
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-[8px] border-[1px] border-[#1B326D] p-[12px_24px] pl-[48px] text-[#22316C] outline-none"
                                    type="text"
                                    id="email"
                                    autoFocus
                                    placeholder="Enter your email"
                                    {...register('email')}
                                />
                                <FontAwesomeIcon
                                    icon={faEnvelope}
                                    className="absolute top-[50%] left-[16px] translate-y-[-50%] text-[#1B326D]"
                                />
                            </div>
                            <p className="mt-1 text-sm text-red-500">{errorMessages.email}</p>
                        </div>

                        <div className="mb-[24px]">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full cursor-pointer rounded-[8px] border-[1px] border-[#1B326D] bg-[#1B326D] p-[11px_24px] text-center text-[14px] font-medium text-white hover:opacity-[0.9] disabled:cursor-not-allowed disabled:opacity-[0.6]"
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-[14px] text-[#22316C]">
                            Remember your password?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="cursor-pointer font-medium text-[#1B326D] hover:font-bold"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RequestOtp;
