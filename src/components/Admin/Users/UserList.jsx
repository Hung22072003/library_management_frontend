import React, { useState, useEffect, useCallback } from 'react';
import { Input, Pagination, Select, message, Modal, Upload, Button, Spin } from 'antd';
import { getAllUsers, importUsers } from '../../../services/userService';
import Loading from '../../Loading';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { FormatDateTime } from '../../../utils/FormatDateTime';
import { UploadOutlined } from '@ant-design/icons';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const size = 8;

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
                setIsModalVisible(false);
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
                    <a
                        href="/admin/users/create"
                        className="flex cursor-pointer items-center rounded-[8px] border-[1px] bg-[#1B326D] p-[8px_24px] text-white"
                    >
                        Create new user
                    </a>
                    <button
                        onClick={() => setIsModalVisible(true)}
                        className="flex cursor-pointer items-center rounded-[8px] border-[1px] bg-[#1B326D] p-[8px_24px] text-white"
                    >
                        Import
                    </button>
                </div>
            </div>

            {/* Modal để upload file Excel */}
            <Modal title="Import Users" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
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
                            Please upload an Excel file (.xlsx or .xls) with columns: ID, Name, Phone.
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
                                    <th className="px-4 py-3 text-left">Role</th>
                                    <th className="px-4 py-3 text-left">Created At</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="text-[14px] text-[#1B326D] hover:bg-gray-50">
                                        <td className="px-4 py-3">{user.id}</td>
                                        <td className="px-4 py-3 font-semibold">
                                            <Link
                                                to={`/admin/users/${user.id}`}
                                                className="max-w-xs truncate hover:font-bold"
                                                title={user.name}
                                            >
                                                {user.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3">{user.phone}</td>
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
