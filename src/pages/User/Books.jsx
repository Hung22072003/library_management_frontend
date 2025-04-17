import { Input, message, Modal, Pagination, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { getAllBooks, getBookById, getBooksByCategory } from '../../services/bookService';
import { getAllCategories } from '../../services/categoryService';
import { faSearch, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '../../utils/FormatCurrency';
import { debounce } from 'lodash';
import Loading from '../../components/Loading';
import { createCart } from '../../services/cartService';
import useCart from '../../hooks/useCart';
const Books = () => {
    const { fetchCarts } = useCart();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const size = 6;

    const handleSelectCategory = (value) => {
        setSelectedCategory(value);
        setSearchTerm('');
        setCurrentPage(1);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleViewDetail = (id) => {
        fetchBookById(id);
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

    const fetchBookById = async (id) => {
        const response = await getBookById(id);
        console.log(response);
        if (response.status === 200) {
            setSelectedBook(response.data.data);
            showModal();
        } else {
            setError('Failed to fetch book detail');
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

    const handleAddCart = async (id, rental_fee) => {
        setLoading(true);
        try {
            const response = await createCart(id, rental_fee);
            fetchCarts();
            fetchBooks(searchTerm);
            message.success('Add book to cart successfully');
        } catch (e) {
            message.error(e.data.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
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
            <div className="mt-[16px]">
                <div className="mb-[16px] flex items-center justify-between">
                    <h1 className="text-[20px] leading-[24px] font-medium text-[#1B326D]">All books</h1>
                    {totalBooks > size && (
                        <div>
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
                </div>

                {loading ? (
                    <Loading />
                ) : (
                    <div className="grid grid-cols-3 gap-[16px]">
                        {books &&
                            books.map((book) => (
                                <div key={book.id} className="flex items-center">
                                    <img src={book.thumbnail} className="h-auto w-[40%]" />

                                    <div className="ml-[24px] flex flex-1 flex-col gap-[12px] text-[14px]">
                                        <p className="font-bold text-[#1B326D]">{book.title}</p>
                                        <span className="text-[#9b9c9d]">
                                            Total:{' '}
                                            <span className="font-medium text-[#1B326D]">{book.total_copies}</span>
                                        </span>
                                        <span className="text-[#9b9c9d]">
                                            Available:{' '}
                                            <span className="font-medium text-[#1B326D]">{book.available_copies}</span>
                                        </span>
                                        <span className="text-[#9b9c9d]">
                                            Rental fee:{' '}
                                            <span className="font-medium text-[#1B326D]">
                                                {formatCurrency(book.rental_fee)}
                                            </span>
                                        </span>

                                        <button
                                            className="max-w-[130px] cursor-pointer rounded-[8px] border-[1px] bg-[#1B326D] p-[8px] text-white"
                                            onClick={() => handleAddCart(book.id, book.rental_fee)}
                                        >
                                            Add to cart
                                        </button>

                                        <span
                                            onClick={() => handleViewDetail(book.id)}
                                            className="cursor-pointer font-medium text-[#1B326D] underline hover:font-bold"
                                        >
                                            View detail
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                <Modal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                    centered
                    width={1000}
                    maskClosable={true}
                >
                    {selectedBook && (
                        <div className="flex bg-white">
                            {/* Thumbnail */}
                            <div className="w-1/3">
                                <img
                                    src={selectedBook.thumbnail}
                                    alt={selectedBook.title}
                                    className="h-auto w-full rounded-lg object-cover"
                                />
                            </div>

                            {/* selectedBook Details */}
                            <div className="w-2/3 pl-6">
                                <h2 className="text-[24px] font-bold text-[#1B326D]">{selectedBook.title}</h2>
                                <p className="text-[14px] text-[#1B326D]">
                                    by {selectedBook.authors.map((a) => a.name).join(', ')}
                                </p>

                                <p className="mt-[12px] font-semibold text-[#1B326D]">
                                    Genre: {selectedBook.categories.map((c) => c.name).join(', ')}
                                </p>
                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    Publication year:
                                    <span className="ml-[4px] text-[#1B326D]">{selectedBook.publication_year}</span>
                                </p>
                                <p className="mt-[12px] text-sm font-semibold text-[#9b9c9d]">
                                    ISBN:
                                    <span className="ml-[4px] text-[#1B326D]">{selectedBook.isbn}</span>
                                </p>
                                <p className="mt-[12px] font-semibold text-[#9b9c9d]">
                                    Rental Fee:
                                    <span className="ml-[4px] text-[#1B326D]">
                                        {formatCurrency(selectedBook.rental_fee)}
                                    </span>
                                </p>
                                <p className="mt-[12px] font-semibold text-[#9b9c9d]">
                                    Available Copies:
                                    <span className="ml-[4px] text-[#1B326D]">
                                        {selectedBook.available_copies} / {selectedBook.total_copies}
                                    </span>
                                </p>

                                {/* <button className="mt-[12px] min-w-[180px] cursor-pointer rounded-[8px] border-[1px] bg-[#1B326D] p-[8px] text-white">
                                    Add to cart
                                </button> */}
                                {selectedBook.deleted_at && (
                                    <p className="mt-2 text-red-600">This book has been removed</p>
                                )}

                                <p className="mt-4 font-semibold text-[#9b9c9d]">Description:</p>

                                <span className="mt-[4px] text-[#1B326D]">{selectedBook.description}</span>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default Books;
