import React from 'react';
import { Button, Empty, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import useCart from '../../hooks/useCart';
import { formatCurrency } from '../../utils/FormatCurrency';
import Loading from '../../components/Loading';
import BorrowDateModal from '../../components/BorrowDateModal';
const Carts = () => {
    const { carts, loading, handleRemoveItem, openBorrowModal } = useCart();

    if (loading) {
        return <Loading />;
    }

    if (!carts.length) {
        return (
            <div>
                <div className="py-8 text-center font-bold">
                    <Empty description="No books in your cart" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="pb-6">
                <h2 className="mb-6 text-xl font-semibold text-[#1B326D]">Cart list</h2>

                {carts.map((cart) => {
                    const book = cart.book;
                    return (
                        <div key={cart.id} className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <div className="flex p-4">
                                <div className="h-36 w-24 flex-shrink-0 bg-gray-200">
                                    {book.thumbnail ? (
                                        <img
                                            src={book.thumbnail}
                                            alt={book.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 pl-4">
                                    <div className="flex justify-between">
                                        <h3 className="text-lg font-medium text-[#1B326D]">{book.title}</h3>
                                        <Button
                                            type="text"
                                            icon={<CloseOutlined />}
                                            onClick={() => handleRemoveItem(cart.id)}
                                            className="text-gray-500 hover:text-gray-800"
                                        />
                                    </div>

                                    <p className="text-[14px] font-medium text-[#1B326D]">
                                        Author: {book.authors.map((a) => a.name).join(', ')}
                                    </p>

                                    <div className="mt-2 text-[14px]">
                                        <span className="font-medium text-[#1B326D]">Genre:</span>{' '}
                                        {book.categories.map((a) => a.name).join(', ')}
                                    </div>

                                    <div className="mt-2 text-[14px]">
                                        <span className="font-medium text-[#1B326D]">Resource ID:</span> {book.id}
                                    </div>

                                    <div className="mt-2 text-[14px]">
                                        <span className="font-medium text-[#1B326D]">Rental fee:</span>{' '}
                                        {formatCurrency(cart.rental_fee)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={openBorrowModal}
                        className="min-w-[130px] cursor-pointer rounded-[8px] border-[1px] bg-[#1B326D] p-[8px] text-white"
                    >
                        Borrow
                    </button>
                </div>

                <BorrowDateModal />
            </div>
        </div>
    );
};

export default Carts;
