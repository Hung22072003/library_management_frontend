import React, { useState, useEffect, useCallback } from 'react';
import { Input, Pagination, Select } from 'antd';
import { getAllBooks, getBooksByCategory } from '../../../services/bookService';
import Loading from '../../Loading';
import { getAllCategories } from '../../../services/categoryService';
import { Link, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import defaultBook from '../../../assets/default-book.png';

const BooksList = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const size = 9;

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

    const handleCreateNewBook = () => {
        navigate('/admin/books/create', {
            replace: true,
        });
    };

    return (
        <div className="mx-auto max-w-[1200px]">
            <div className="flex items-center">
                <div className="relative">
                    <Select
                        defaultValue={selectedCategory}
                        showSearch
                        filterOption={filterOption}
                        onChange={handleSelectCategory}
                        style={{
                            width: '250px',
                            color: '#1B326D',
                            height: '42px',
                        }}
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
                <span
                    onClick={handleCreateNewBook}
                    className="flex cursor-pointer items-center rounded-[8px] border-[1px] bg-[#1B326D] p-[8px_24px] text-white"
                >
                    Create new book
                </span>
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
                                    <th className="min-w-[180px] px-4 py-3 text-left">ISBN13</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">ISBN10</th>
                                    <th className="min-w-[300px] px-4 py-3 text-left">Title</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Authors</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Genre</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Publication Year</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Available Copies</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Total Copies</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Status</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Num_Pages</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left">Language</th>
                                    <th className="min-w-[80px] px-4 py-3 text-left">Floor</th>
                                    <th className="min-w-[80px] px-4 py-3 text-left">Shelf</th>
                                    <th className="min-w-[80px] px-4 py-3 text-left">Row</th>
                                    <th className="min-w-[80px] px-4 py-3 text-left">Col</th>
                                    <th className="min-w-[180px] px-4 py-3 text-left"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {books.map((book) => (
                                    <tr key={book.id} className="text-[14px] text-[#1B326D] hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <img
                                                src={book.thumbnail || defaultBook}
                                                alt={book.title}
                                                className="h-auto w-16 rounded object-cover"
                                            />
                                        </td>
                                        <td className="px-4 py-3">{book.isbn13}</td>
                                        <td className="px-4 py-3">{book.isbn10}</td>
                                        <td className="px-4 py-3 font-semibold">
                                            <Link
                                                to={`/admin/books/${book.id}`}
                                                className="hover:font-bold"
                                                title={book.title}
                                            >
                                                {book.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">{book.authors}</td>
                                        <td className="px-4 py-3">
                                            {book.categories && book.categories.map((a) => a.name).join(', ')}
                                        </td>
                                        <td className="px-4 py-3">{book.publication_year}</td>

                                        <td className="px-4 py-3">{book.available_copies}</td>
                                        <td className="px-4 py-3">{book.total_copies}</td>
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
                                        <td className="px-4 py-3">{book.num_pages}</td>
                                        <td className="px-4 py-3">{book.language}</td>
                                        <td className="px-4 py-3">{book.floor}</td>
                                        <td className="px-4 py-3">{book.shelf}</td>
                                        <td className="px-4 py-3">{book.row}</td>
                                        <td className="px-4 py-3">{book.col}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                onClick={() => {
                                                    navigate(`/admin/books/${book.id}/copies`, { replace: true });
                                                }}
                                                className="cursor-pointer hover:font-bold"
                                            >
                                                Book Copies
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
