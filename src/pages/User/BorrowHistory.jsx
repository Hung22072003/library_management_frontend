import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../../utils/FormatCurrency';
import { Input, message, Pagination, Select } from 'antd';
import { getAllBooks, getBooksByCategory } from '../../services/bookService';
import Loading from '../../components/Loading';
import { getAllCategories } from '../../services/categoryService';
import { Link, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import { getBatchesOfUser } from '../../services/loanService';
import { formatDate } from '../../utils/FormatDateTime';
const statusColors = {
    pending: 'bg-blue-200 text-blue-800',
    borrowed: 'bg-yellow-200 text-yellow-800',
    returned: 'bg-green-200 text-green-800',
    overdue: 'bg-red-200 text-red-800',
    'returned (late)': 'bg-orange-200 text-orange-800',
    cancel: 'bg-rose-200 text-rose-800',
};
const BorrowHistory = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBatches, setTotalBatches] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const size = 9;

    // useEffect(() => {
    //     debouncedFetchBooks(searchTerm);
    // }, [currentPage, selectedCategory, searchTerm]);

    useEffect(() => {
        fetchBatches();
    }, [currentPage]);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await getBatchesOfUser(currentPage, size);
            setBatches(response.data.data.data);
            setTotalBatches(response.data.data.total);
        } catch (e) {
            message.error(e.data.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // const debouncedFetchBooks = useCallback(
    //     debounce((query) => fetchBooks(query), 300),
    //     [selectedCategory, currentPage],
    // );
    return (
        <div className="mx-auto max-w-[1200px]">
            <div className="flex items-center justify-between">
                <h1 className="my-[24px] text-[20px] font-bold text-[#1B326D]">Borrow History</h1>
            </div>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className="overflow-hidden overflow-x-auto">
                        <table className="min-w-full overflow-hidden rounded-lg bg-white shadow-lg">
                            <thead className="bg-gray-100 text-[16px] text-[#1B326D]">
                                <tr>
                                    <th className="min-w-[200px] px-4 py-3 text-left">ID</th>
                                    <th className="min-w-[160px] px-4 py-3 text-left">Status</th>
                                    <th className="min-w-[160px] px-4 py-3 text-left">Borrow Date</th>
                                    <th className="min-w-[160px] px-4 py-3 text-left">Due Date</th>
                                    <th className="min-w-[160px] px-4 py-3 text-left">Return Date</th>
                                    <th className="min-w-[200px] px-4 py-3 text-left">Expired Borrow Date</th>
                                    <th className="min-w-[160px] px-4 py-3 text-left">Extend Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {batches.map((batch) => (
                                    <tr
                                        onClick={() => {
                                            navigate(`/borrowHistory/${batch.id}`);
                                        }}
                                        key={batch.id}
                                        className="cursor-pointer text-[14px] text-[#1B326D] hover:bg-gray-100"
                                    >
                                        <td className="px-4 py-3">{batch.id}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${statusColors[batch.status]}`}
                                            >
                                                {batch.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{formatDate(batch.borrowed_at)}</td>
                                        <td className="px-4 py-3">{formatDate(batch.due_at)}</td>
                                        <td className="px-4 py-3">{formatDate(batch.return_at)}</td>
                                        <td className="px-4 py-3">{formatDate(batch.expired_at)}</td>
                                        <td className="px-4 py-3">{formatDate(batch.extended_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalBatches > size && (
                        <div className="mt-[24px]">
                            <Pagination
                                showSizeChanger={false}
                                current={currentPage}
                                onChange={handlePageChange}
                                total={totalBatches}
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

export default BorrowHistory;
