import * as yup from 'yup';
export const schemaRegister = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    fullname: yup.string().required('Fullname is required').min(3, 'Fullname must be at least 3 characters'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup
        .string()
        .required('Confirm Password is required')
        .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

export const schemaLogin = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});
