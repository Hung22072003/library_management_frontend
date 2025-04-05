import axios from './axiosInstance';

const getAllBooks = (page, size, search) => {
    return axios.get(`api/books?page=${page}&size=${size}&q=${search}`);
};

const getBookById = (id) => {
    return axios.get(`api/books/${id}`);
};

const getBooksByCategory = (categoryId, page, size, search) => {
    return axios.get(`api/books/category/${categoryId}?page=${page}&size=${size}&q=${search}`);
};

const createBook = (values, thumbnail) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('publication_year', values.publication_year);
    formData.append('isbn', values.isbn);
    formData.append('rental_fee', values.rental_fee);
    formData.append('available_copies', values.total_copies);
    formData.append('total_copies', values.total_copies);

    // Thêm categories[] (mảng)
    if (values.categories) {
        values.categories.forEach((category) => {
            formData.append('categories[]', category);
        });
    }

    // Thêm authors[] (mảng)
    if (values.authors) {
        values.authors.forEach((author) => {
            formData.append('authors[]', author);
        });
    }

    if (thumbnail) {
        formData.append('thumbnail', thumbnail);
    }

    return axios.post('api/books', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const updateBook = async (id, values, thumbnail) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('publication_year', values.publication_year);
    formData.append('isbn', values.isbn);
    formData.append('rental_fee', values.rental_fee);
    formData.append('total_copies', values.total_copies);
    formData.append('categories[]', values.categories); // Mảng categories
    formData.append('authors[]', values.authors); // Mảng authors
    if (thumbnail) {
        formData.append('thumbnail', thumbnail); // Thêm file ảnh nếu có
    }
    return await axios.post(`/api/books/${id}?_method=PUT`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const deleteBook = (id) => {
    return axios.delete(`/api/books/${id}`);
};

const restoreBook = (id) => {
    return axios.post(`/api/books/${id}`);
};
export { getAllBooks, getBookById, getBooksByCategory, createBook, updateBook, deleteBook, restoreBook };
