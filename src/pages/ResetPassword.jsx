import background from '../assets/background.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faEye, faEyeSlash, faLock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { notification } from 'antd';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../services/authService';

// Schema validation cho reset password
const schemaResetPassword = yup.object({
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords do not match'),
});

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const otp = location.state?.otp;

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schemaResetPassword),
    });

    const [errorMessages, setErrorMessages] = useState({ password: '', confirmPassword: '' });

    useEffect(() => {
        if (!email || !otp) {
            navigate('/forgot-password/request-otp');
        }
    }, [email, otp, navigate]);

    useEffect(() => {
        setErrorMessages({
            password: errors.password?.message ?? '',
            confirmPassword: errors.confirmPassword?.message ?? '',
        });
    }, [errors.password, errors.confirmPassword]);

    const onSubmit = async (data) => {
        console.log(data);
        setIsLoading(true);
        try {
            const response = await resetPassword(email, data.password);

            if (response) {
                notification.open({
                    type: 'success',
                    message: 'Success',
                    description: response.data.message || 'Password reset successful',
                    duration: 2,
                });
                navigate('/login');
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

    return (
        <div className="flex flex-col items-center bg-[#F6F8FF] lg:flex-row">
            <div className="relative hidden h-screen w-[50%] lg:block">
                <img src={background} alt="#" className="h-screen w-full" />
            </div>

            <div className="flex w-[100%] flex-1 flex-col px-[24px] sm:w-[70%] lg:w-[50%] lg:px-[50px] xl:px-[100px] 2xl:px-[150px]">
                <div className="rounded-[8px] border-[1px] border-[#E5E7EB] bg-white p-[32px] shadow-[4px_4px_30px_4px_rgba(0,0,0,0.1)]">
                    <div className="mb-[20px]">
                        <button
                            onClick={() => navigate('/forgot-password/verify-otp', { state: { email } })}
                            className="flex cursor-pointer items-center text-[#1B326D] hover:font-bold hover:text-[#22316C]"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            <span className="text-[14px] font-medium">Back</span>
                        </button>
                    </div>

                    <div className="mb-[12px] flex items-center justify-center">
                        <FontAwesomeIcon icon={faLock} size={'2xl'} className="text-[#22316C]" />
                    </div>
                    <h1 className="mb-[3px] text-center text-[30px] font-bold text-[#1B326D]">Reset Password</h1>
                    <p className="mb-[32px] text-center text-[14px] text-[#22316C]">
                        Create a new password for your account
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-[24px]">
                            <label htmlFor="password" className="mb-[4px] block text-[14px] font-medium text-[#22316C]">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-[8px] border-[1px] border-[#1B326D] p-[12px_24px] text-[#22316C] outline-none"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoFocus
                                    placeholder="Enter new password"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center text-[#1B326D]"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-red-500">{errorMessages.password}</p>
                        </div>

                        <div className="mb-[24px]">
                            <label
                                htmlFor="confirmPassword"
                                className="mb-[4px] block text-[14px] font-medium text-[#22316C]"
                            >
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-[8px] border-[1px] border-[#1B326D] p-[12px_24px] text-[#22316C] outline-none"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    placeholder="Confirm new password"
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center text-[#1B326D]"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-red-500">{errorMessages.confirmPassword}</p>
                        </div>

                        <div className="mb-[24px]">
                            <div className="rounded-[8px] bg-[#F0F4FF] p-[16px]">
                                <h4 className="mb-[8px] text-[14px] font-medium text-[#1B326D]">
                                    Password Requirements:
                                </h4>
                                <ul className="text-[12px] text-[#22316C]">
                                    <li>• At least 6 characters long</li>
                                    <li>• Avoid using personal information</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mb-[24px]">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full cursor-pointer rounded-[8px] border-[1px] border-[#1B326D] bg-[#1B326D] p-[11px_24px] text-center text-[14px] font-medium text-white hover:opacity-[0.9] disabled:cursor-not-allowed disabled:opacity-[0.6]"
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
