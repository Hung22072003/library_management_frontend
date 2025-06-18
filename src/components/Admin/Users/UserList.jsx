import React, { useState, useEffect, useCallback } from 'react';
import { Input, Pagination, Select, message, Modal, Upload, Button, Spin, Form } from 'antd';
import { getAllUsers, importUsers, createUser, updateUser } from '../../../services/userService';
import Loading from '../../Loading';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { FormatDateTime } from '../../../utils/FormatDateTime';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [createForm] = Form.useForm();
    const [updateForm] = Form.useForm();
    const size = 8;

    // Faculty options
    const facultyOptions = [
        { value: 'Advanced Science and Technology', label: 'Advanced Science and Technology' },
        { value: 'Architecture', label: 'Architecture' },
        { value: 'Chemical Engineering', label: 'Chemical Engineering' },
        { value: 'Civil Engineering', label: 'Civil Engineering' },
        { value: 'Electrical Engineering', label: 'Electrical Engineering' },
        {
            value: 'Electronics and Telecommunication Engineering',
            label: 'Electronics and Telecommunication Engineering',
        },
        { value: 'Environment', label: 'Environment' },
        { value: 'Information Technology', label: 'Information Technology' },
        { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
        { value: 'Project Management', label: 'Project Management' },
        { value: 'Road and Bridge Engineering', label: 'Road and Bridge Engineering' },
        { value: 'Heat and Refrigeration Engineering', label: 'Heat and Refrigeration Engineering' },
        { value: 'Transportation Mechanical Engineering', label: 'Transportation Mechanical Engineering' },
        { value: 'Water Resources Engineering', label: 'Water Resources Engineering' },
    ];

    useEffect(() => {
        debouncedFetchUsers(searchTerm);
    }, [currentPage, searchTerm]);

    const fetchUsers = async (query = '') => {
        setLoading(true);
        try {
            const response = await getAllUsers(currentPage, size, query);

            if (response.status === 200) {
                setUsers(response.data.data.data);
                setTotalUsers(response.data.data.total);
                setLoading(false);
            } else {
                setError('Failed to fetch users');
                setLoading(false);
            }
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const debouncedFetchUsers = useCallback(
        debounce((query) => fetchUsers(query), 300),
        [currentPage],
    );

    // Hàm xử lý import file Excel
    const handleImport = async (file) => {
        setImportLoading(true);
        try {
            const response = await importUsers(file);
            if (response.data.status === 200) {
                message.success(response.data.message);
                setIsImportModalVisible(false);
                fetchUsers(searchTerm); // Làm mới danh sách user sau khi import thành công
            } else {
                message.error(response.data.message || 'Failed to import users');
            }
        } catch (err) {
            message.error(err.data?.message || err.message);
        } finally {
            setImportLoading(false); // Tắt loading sau khi hoàn thành (dù thành công hay thất bại)
        }
    };

    // Hàm xử lý tạo user mới
    const handleCreateUser = async (values) => {
        setCreateLoading(true);
        try {
            const response = await createUser(values);
            if (response.status === 201 || (response.data && response.data.status === 201)) {
                message.success('User created successfully!');
                setIsCreateModalVisible(false);
                createForm.resetFields();
                fetchUsers(searchTerm);
            }
        } catch (err) {
            message.error(
                err.data?.errors?.id ||
                    err.data?.errors?.email ||
                    err.data?.errors?.phone ||
                    err.data?.errors?.faculty ||
                    'Failed to create user',
            );
        } finally {
            setCreateLoading(false);
        }
    };

    // Hàm xử lý update user
    const handleUpdateUser = async (values) => {
        setUpdateLoading(true);
        try {
            const response = await updateUser(selectedUser.id, values);
            if (response.status === 201 || (response.data && response.data.status === 201)) {
                message.success('User updated successfully!');
                setIsUpdateModalVisible(false);
                updateForm.resetFields();
                setSelectedUser(null);
                fetchUsers(searchTerm);
            }
        } catch (err) {
            message.error(
                err.data?.errors?.name ||
                    err.data?.errors?.phone ||
                    err.data?.errors?.faculty ||
                    'Failed to update user',
            );
        } finally {
            setUpdateLoading(false);
        }
    };

    // Hàm mở modal update
    const handleOpenUpdateModal = (user) => {
        setSelectedUser(user);
        updateForm.setFieldsValue({
            name: user.name,
            phone: user.phone,
            faculty: user.faculty,
        });
        setIsUpdateModalVisible(true);
    };

    // Hàm đóng modal tạo user
    const handleCancelCreateModal = () => {
        setIsCreateModalVisible(false);
        createForm.resetFields();
    };

    // Hàm đóng modal update
    const handleCancelUpdateModal = () => {
        setIsUpdateModalVisible(false);
        updateForm.resetFields();
        setSelectedUser(null);
    };

    // Props cho Upload component
    const uploadProps = {
        beforeUpload: (file) => {
            const isExcel =
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel';
            if (!isExcel) {
                message.error('You can only upload Excel files (.xlsx, .xls)!');
                return false;
            }
            handleImport(file);
            return false; // Ngăn Upload component tự động upload
        },
        showUploadList: false,
        disabled: importLoading, // Vô hiệu hóa nút upload khi đang loading
    };

    return (
        <div className="mx-auto max-w-[1200px]">
            <div className="flex items-center">
                <label htmlFor="" className="mr-[12px] font-medium text-[#1B326D]">
                    Search
                </label>
                <Input
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{ height: '42px', width: '250px', color: '#1B326D', outline: 'none' }}
                    placeholder="Search by name or email"
                />
            </div>

            <div className="flex items-center justify-between">
                <h1 className="my-[24px] text-[20px] font-bold text-[#1B326D]">Users List</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreateModalVisible(true)}
                        className="flex cursor-pointer items-center rounded-[8px] border-[1px] bg-[#1B326D] p-[8px_24px] text-white transition-colors hover:bg-[#2A4A8D]"
                    >
                        <PlusOutlined className="mr-2" />
                        Create new user
                    </button>
                    <button
                        onClick={() => setIsImportModalVisible(true)}
                        className="flex cursor-pointer items-center rounded-[8px] border-[1px] bg-[#1B326D] p-[8px_24px] text-white transition-colors hover:bg-[#2A4A8D]"
                    >
                        <UploadOutlined className="mr-2" />
                        Import
                    </button>
                </div>
            </div>

            {/* Modal để tạo user mới */}
            <Modal
                title="Create New User"
                open={isCreateModalVisible}
                onCancel={handleCancelCreateModal}
                footer={null}
                width={500}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreateUser} className="mt-4">
                    <Form.Item
                        label="ID"
                        name="id"
                        rules={[
                            { required: true, message: 'Please input the ID!' },
                            { pattern: /^\d+$/, message: 'ID must be a number!' },
                            { min: 6, message: 'ID must be at least 6 number' },
                        ]}
                    >
                        <Input placeholder="Enter user ID" />
                    </Form.Item>

                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please input the name!' },
                            { min: 2, message: 'Name must be at least 2 characters!' },
                        ]}
                    >
                        <Input placeholder="Enter user name" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input the email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input placeholder="Enter user email" />
                    </Form.Item>

                    <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[
                            { required: true, message: 'Please input the phone number!' },
                            { pattern: /^\d{10}$/, message: 'Phone number must be 10 digits!' },
                        ]}
                    >
                        <Input placeholder="Enter phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Faculty"
                        name="faculty"
                        rules={[{ required: true, message: 'Please select a faculty!' }]}
                    >
                        <Select placeholder="Select faculty" style={{ height: '40px' }}>
                            {facultyOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button onClick={handleCancelCreateModal}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={createLoading}
                            style={{ backgroundColor: '#1B326D' }}
                        >
                            Create User
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Modal để update user */}
            <Modal
                title="Update User"
                open={isUpdateModalVisible}
                onCancel={handleCancelUpdateModal}
                footer={null}
                width={500}
            >
                <Form form={updateForm} layout="vertical" onFinish={handleUpdateUser} className="mt-4">
                    <Form.Item label="ID">
                        <Input value={selectedUser?.id} disabled style={{ backgroundColor: '#f5f5f5' }} />
                    </Form.Item>

                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please input the name!' },
                            { min: 2, message: 'Name must be at least 2 characters!' },
                        ]}
                    >
                        <Input placeholder="Enter user name" />
                    </Form.Item>

                    <Form.Item label="Email">
                        <Input value={selectedUser?.email} disabled style={{ backgroundColor: '#f5f5f5' }} />
                    </Form.Item>

                    <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[
                            { required: true, message: 'Please input the phone number!' },
                            { pattern: /^\d{10}$/, message: 'Phone number must be 10 digits!' },
                        ]}
                    >
                        <Input placeholder="Enter phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Faculty"
                        name="faculty"
                        rules={[{ required: true, message: 'Please select a faculty!' }]}
                    >
                        <Select placeholder="Select faculty" style={{ height: '40px' }}>
                            {facultyOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button onClick={handleCancelUpdateModal}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={updateLoading}
                            style={{ backgroundColor: '#1B326D' }}
                        >
                            Update User
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Modal để upload file Excel */}
            <Modal
                title="Import Users"
                open={isImportModalVisible}
                onCancel={() => setIsImportModalVisible(false)}
                footer={null}
            >
                {importLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loading />
                    </div>
                ) : (
                    <>
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Select Excel File</Button>
                        </Upload>
                        <p className="mt-2 text-sm text-gray-500">
                            Please upload an Excel file (.xlsx or .xls) with columns: ID, Name, Phone, Faculty.
                        </p>
                    </>
                )}
            </Modal>

            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className="overflow-hidden overflow-x-auto">
                        <table className="min-w-full overflow-hidden rounded-lg bg-white shadow-lg">
                            <thead className="bg-gray-100 text-[16px] text-[#1B326D]">
                                <tr>
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Phone</th>
                                    <th className="px-4 py-3 text-left">Faculty</th>
                                    <th className="px-4 py-3 text-left">Role</th>
                                    <th className="px-4 py-3 text-left">Created At</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="cursor-pointer text-[14px] text-[#1B326D] hover:bg-gray-50"
                                        onClick={() => handleOpenUpdateModal(user)}
                                    >
                                        <td className="px-4 py-3">{user.id}</td>
                                        <td className="px-4 py-3 font-semibold">
                                            <span className="max-w-xs truncate hover:font-bold" title={user.name}>
                                                {user.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3">{user.phone}</td>
                                        <td className="px-4 py-3">{user.faculty || 'N/A'}</td>
                                        <td className="px-4 py-3">{user.role}</td>
                                        <td className="px-4 py-3">
                                            {user.created_at ? FormatDateTime(user.created_at) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    !user.deleted_at
                                                        ? 'rounded-md bg-green-200 px-2 py-1 text-xs font-medium text-green-800 capitalize'
                                                        : 'rounded-md bg-red-300 px-2 py-1 text-xs font-medium text-red-500 capitalize'
                                                }
                                            >
                                                {!user.deleted_at ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalUsers > size && (
                        <div className="mt-[24px]">
                            <Pagination
                                showSizeChanger={false}
                                current={currentPage}
                                onChange={handlePageChange}
                                total={totalUsers}
                                pageSize={size}
                                align="center"
                                className="text-[#1B326D]"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserList;
