import background from '../assets/background.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faBookOpen, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from '../hooks/useAuth';
import { schemaLogin } from '../utils/ValidationForm';
import { notification } from 'antd';
import useCart from '../hooks/useCart';

function Login() {
    const { fetchCarts } = useCart();
    const { handleLogin } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schemaLogin),
    });

    const [errorMessages, setErrorMessages] = useState({ email: '', password: '' });

    useEffect(() => {
        setErrorMessages({
            email: errors.email?.message ?? '',
            password: errors.password?.message ?? '',
        });
    }, [errors.email, errors.password]);

    const onSubmit = async (data) => {
        const response = await handleLogin(data);
        if (response === 401) {
            notification.open({
                type: 'error',
                message: 'Login fail',
                description: 'Incorrect email or password',
                duration: 2,
            });
            return;
        }
        fetchCarts();
    };
    return (
        <div className="flex flex-col items-center bg-[#F6F8FF] lg:flex-row">
            {/* <img src={logo} alt="#" className="hidden h-[80px] max-lg:block sm:h-[100px]" /> */}
            <div className="relative hidden h-screen w-[50%] lg:block">
                {/* <img src={logo} alt="#" className="absolute left-[50%] translate-x-[-50%] lg:h-[100px]" /> */}
                <img src={background} alt="#" className="h-screen w-full" />
            </div>

            <div className="flex w-[100%] flex-1 flex-col px-[24px] sm:w-[70%] lg:w-[50%] lg:px-[50px] xl:px-[100px] 2xl:px-[150px]">
                <div className="rounded-[8px] border-[1px] border-[#E5E7EB] bg-white p-[32px] shadow-[4px_4px_30px_4px_rgba(0,0,0,0.1)]">
                    <div className="mb-[12px] flex items-center justify-center">
                        <FontAwesomeIcon icon={faBookOpen} size={'2xl'} className="text-[#22316C]" />
                    </div>
                    <h1 className="mb-[3px] text-center text-[30px] font-bold text-[#1B326D]">Welcome to BookWorm</h1>
                    <p className="mb-[32px] text-center text-[14px] text-[#22316C]">Please sign in to your account</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <div className="mb-[24px]">
                                <label
                                    htmlFor="email"
                                    className="mb-[4px] block text-[14px] font-medium text-[#22316C]"
                                >
                                    Email address
                                </label>
                                <input
                                    className="w-full rounded-[8px] border-[1px] border-[#1B326D] p-[12px_24px] text-[#22316C] outline-none"
                                    type="text"
                                    id="email"
                                    autoFocus
                                    placeholder="Enter your email"
                                    {...register('email')}
                                />
                                <p className="mt-1 text-sm text-red-500">{errorMessages.email}</p>
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-[4px] block text-[14px] font-medium text-[#1B326D]"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full rounded-[8px] border-[1px] border-[#1B326D] p-[12px_24px] text-[#22316C] outline-none"
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="Enter your password"
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
                        </div>

                        <div className="mt-[24px]">
                            <a href="#" className="text-[14px] font-medium text-[#1B326D] hover:font-bold">
                                Forgot password?
                            </a>
                        </div>

                        <div className="my-[24px]">
                            <button
                                type="submit"
                                className="w-full cursor-pointer rounded-[8px] border-[1px] border-[#1B326D] bg-[#1B326D] p-[11px_24px] text-center text-[14px] font-medium text-white hover:opacity-[0.9]"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    {/* <div className="relative">
                        <p className="text-center text-[14px] text-[#6B7280]">Or continue with</p>
                        <div className="absolute top-[50%] h-[1px] w-full bg-[#D1D5DB]"></div>
                    </div> */}

                    {/* <div className="my-[24px] flex justify-between">
                        <button className="cursor-pointer rounded-[8px] border-[1px] border-[#D1D5DB] p-[8px_30px] sm:p-[8px_50px] 2xl:p-[8px_65px]">
                            <FontAwesomeIcon icon={faGoogle} className="mr-[6px] text-[#EF4444]" /> Google
                        </button>
                        <button className="cursor-pointer rounded-[8px] border-[1px] border-[#D1D5DB] p-[8px_30px] sm:p-[8px_50px] 2xl:p-[8px_65px]">
                            <FontAwesomeIcon icon={faFacebook} className="mr-[6px] text-[#2563EB]" /> Facebook
                        </button>
                    </div> */}

                    <div className="text-center text-[14px] text-[#1B326D]">
                        Don't have an account?{' '}
                        <a href="/register" className="ml-[4px] font-medium text-[#1B326D] hover:font-bold">
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
