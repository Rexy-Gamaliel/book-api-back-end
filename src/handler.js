/* eslint linebreak-style: ["error", "windows"] */

const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // if name is undefined
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // if readPage > pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  try {
    const id = nanoid();
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };

    books.push(newBook);

    const success = books.filter((book) => book.id === id).length === 1;

    if (success) {
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      });
      response.code(201);
      return response;
    }
    throw new Error('Error failed to add newBook to books');
  } catch (err) {
    console.log(err);
    const response = h.response({
      status: 'error',
      message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
  }
};

const getAllBooksHandler = (request, h) => {
  const nameChecker = (book, _name) => book.name.toLowerCase().includes(_name.toLowerCase());
  // eslint-disable-next-line eqeqeq
  const readingChecker = (book, _reading) => book.reading == _reading;
  // eslint-disable-next-line eqeqeq
  const finishedChecker = (book, _finished) => book.finished == _finished;

  const { name, reading, finished } = request.query;
  const filteredBookIds = new Array(books.length).fill(true);
  const data = [];

  // filter all eligible books, for any filter provided
  if (name !== undefined) {
    books.forEach((book, idx) => {
      if (!nameChecker(book, name)) {
        filteredBookIds[idx] = false;
      }
    });
  }
  if (reading !== undefined) {
    books.forEach((book, idx) => {
      if (!readingChecker(book, reading)) {
        filteredBookIds[idx] = false;
      }
    });
  }
  if (finished !== undefined) {
    books.forEach((book, idx) => {
      if (!finishedChecker(book, finished)) {
        filteredBookIds[idx] = false;
      }
    });
  }

  filteredBookIds.forEach((isEligible, idx) => {
    if (isEligible) {
      data.push({
        id: books[idx].id,
        name: books[idx].name,
        publisher: books[idx].publisher,
      });
    }
  });

  const response = h.response({
    status: 'success',
    data: {
      books: data,
    },
  });
  response.code(200);
  return response;
};

const getAllBooksWithQueryHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  const conditionChecker = (book, _name, _reading, _finished) => {
    let nameMatches = true;
    let readingMatches = true;
    let finishedMatches = true;

    if (_name !== undefined) {
      nameMatches = book.name.toLowerCase().includes(_name);
    }
    if (_reading !== undefined) {
      // eslint-disable-next-line eqeqeq
      readingMatches = book.reading == _reading;
    }
    if (_finished !== undefined) {
      // eslint-disable-next-line eqeqeq
      finishedMatches = book.finished == _finished;
    }

    return nameMatches && readingMatches && finishedMatches;
  };

  const data = [];

  books
    .filter((book) => conditionChecker(book, name, reading, finished))
    .forEach(
      (book) => {
        data.push(
          {
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          },
        );
      },
    );

  const response = h.response({
    status: 'success',
    data: {
      books: data,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    const response = h.response({
      status: 'success',
      data: {
        book: books[index],
      },
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // if name is undefined
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // if readPage > pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    const updatedAt = new Date().toISOString();

    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getAllBooksWithQueryHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
