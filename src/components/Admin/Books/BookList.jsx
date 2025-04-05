import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../../../utils/FormatCurrency';
import { Input, Pagination, Select } from 'antd';
import { getAllBooks, getBooksByCategory } from '../../../services/bookService';
import Loading from '../../Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { getAllCategories } from '../../../services/categoryService';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

const BooksList = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const size = 6;

    const handleSelectCategory = (value) => {
        setSelectedCategory(value);
        setSearchTerm('');
        setCurrentPage(1);
    };

    useEffect(() => {
        debouncedFetchBooks(searchTerm);
    }, [currentPage, selectedCategory, searchTerm]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchBooks = async (query = '') => {
        setLoading(true);
        let response;
        console.log(selectedCategory);
        if (selectedCategory === 'all') {
            response = await getAllBooks(currentPage, size, query);
        } else {
            response = await getBooksByCategory(selectedCategory, currentPage, size, query);
        }

        if (response.status === 200) {
            setBooks(response.data.data.data);
            setTotalBooks(response.data.data.total);
            setLoading(false);
        } else {
            setError('Failed to fetch books');
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        const response = await getAllCategories();
        if (response.status === 200) {
            setCategories(response.data.data);
            setLoading(false);
        } else {
            setError('Failed to fetch categories');
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const filterOption = (input, option) => {
        return option.children.toLowerCase().includes(input.toLowerCase());
    };

    const debouncedFetchBooks = useCallback(
        debounce((query) => fetchBooks(query), 300),
        [selectedCategory, currentPage],
    );
    return (
        <div className="mx-auto max-w-[1200px]">
            <div className="flex items-center">
                <div className="relative">
                    <Select
                        defaultValue={selectedCategory}
                        showSearch // Bật tính năng tìm kiếm
                        filterOption={filterOption}
                        onChange={handleSelectCategory}
                        style={{
                            width: '250px',
                            color: '#1B326D',
                            height: '42px',
                        }}
                        dropdownStyle={{ maxHeight: '100px' }}
                    >
                        <Select.Option
                            style={{
                                color: '#1B326D',
                            }}
                            value="all"
                        >
                            All books
                        </Select.Option>
                        {categories.map((category) => (
                            <Select.Option
                                style={{
                                    color: '#1B326D',
                                }}
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="mx-[24px] flex items-center">
                    <label htmlFor="" className="mr-[12px] font-medium text-[#1B326D]">
                        Keywords
                    </label>
                    <Input
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                        style={{ height: '42px', width: '250px', color: '#1B326D', outline: 'none' }}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <h1 className="my-[24px] text-[20px] font-bold text-[#1B326D]">Books List</h1>
                <a
                    href="/admin/books/create"
                    className="flex cursor-pointer items-center rounded-[8px] border-[1px] bg-[#1B326D] p-[8px_24px] text-white"
                >
                    Create new book
                </a>
            </div>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className="overflow-hidden overflow-x-auto">
                        <table className="overflow-hidden rounded-lg bg-white shadow-lg">
                            <thead className="bg-gray-100 text-[16px] text-[#1B326D]">
                                <tr>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Thumbnail</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">ISBN</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Title</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Author</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Genre</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Publication Year</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Rental fee</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Available Copies</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Total Copies</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {books.map((book) => (
                                    <tr key={book.id} className="text-[14px] text-[#1B326D] hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <img
                                                src={book.thumbnail || '/placeholder-book.jpg'}
                                                alt={book.title}
                                                className="h-auto w-16 rounded object-cover"
                                            />
                                        </td>
                                        <td className="px-4 py-3">{book.isbn}</td>
                                        <td className="px-4 py-3 font-semibold">
                                            <Link
                                                to={`/admin/books/${book.id}`}
                                                className="max-w-xs truncate hover:font-bold"
                                                title={book.title}
                                            >
                                                {book.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            {book.authors && book.authors.map((a) => a.name).join(', ')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {book.categories && book.categories.map((a) => a.name).join(', ')}
                                        </td>
                                        <td className="px-4 py-3">{book.publication_year}</td>
                                        <td className="px-4 py-3">{formatCurrency(book.rental_fee)}</td>

                                        <td className="px-4 py-3 text-center">{book.available_copies}</td>
                                        <td className="px-4 py-3 text-center">{book.total_copies}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    !book.deleted_at
                                                        ? 'rounded-md bg-green-200 px-2 py-1 text-xs font-medium text-green-800 capitalize'
                                                        : 'rounded-md bg-red-300 px-2 py-1 text-xs font-medium text-red-500 capitalize'
                                                }
                                            >
                                                {!book.deleted_at ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalBooks > size && (
                        <div className="mt-[24px]">
                            <Pagination
                                showSizeChanger={false}
                                current={currentPage}
                                onChange={handlePageChange}
                                total={totalBooks}
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

export default BooksList;
