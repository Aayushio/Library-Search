/* ==========================================
   BookSphere - search.js
   Fixed OpenLibrary Version
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initSearchPage();
});

/* ==========================================
   INIT
========================================== */

function initSearchPage() {

    const params = new URLSearchParams(window.location.search);

    const query = params.get("q") || "classic books";

    const input = document.getElementById("searchInput");

    if (input) input.value = query;

    setupForm();
    searchBooks(query);
}

/* ==========================================
   FORM
========================================== */

function setupForm() {

    const form = document.getElementById("searchForm");

    if (!form) return;

    form.addEventListener("submit", e => {

        e.preventDefault();

        const input = document.getElementById("searchInput");

        if (!input) return;

        const value = input.value.trim();

        if (!value) return;

        window.location.href =
        `search.html?q=${encodeURIComponent(value)}`;
    });
}

/* ==========================================
   SEARCH BOOKS
========================================== */

async function searchBooks(query) {

    const grid = document.getElementById("booksGrid");

    if (!grid) return;

    grid.innerHTML =
    `<div class="loader">Searching...</div>`;

    try {

        const res = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=24`
        );

        const data = await res.json();

        const books = data.docs || [];

        const titleBox = document.getElementById("resultTitle");
        const countBox = document.getElementById("resultCount");

        if (titleBox)
            titleBox.innerText = `Results for "${query}"`;

        if (countBox)
            countBox.innerText = `${books.length} Results`;

        if (books.length === 0) {

            grid.innerHTML = `
            <div class="empty-state">
                No results found.
                <p>Try another keyword or author.</p>
            </div>`;

            return;
        }

        renderBooks(books);

    } catch (error) {

        console.log("Search Error:", error);

        grid.innerHTML = `
        <div class="empty-state">
            Unable to search.
            <p>Please try again later.</p>
        </div>`;
    }
}

/* ==========================================
   RENDER RESULTS
========================================== */

function renderBooks(books) {

    const grid = document.getElementById("booksGrid");

    if (!grid) return;

    grid.innerHTML = "";

    books.forEach(book => {

        const title =
            book.title || "Unknown Title";

        const author =
            book.author_name
            ? book.author_name[0]
            : "Unknown Author";

        const img =
            book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
            : "https://via.placeholder.com/220x290?text=No+Cover";

        const year =
            book.first_publish_year || "N/A";

        const key =
            book.key || "";

        grid.innerHTML += `

        <a href="book.html?key=${encodeURIComponent(key)}" class="book-card">

            <img src="${img}"
                 onerror="this.src='https://via.placeholder.com/220x290?text=No+Cover'">

            <h3>${title}</h3>

            <p>${author}</p>

            <div class="meta">${year}</div>

        </a>
        `;
    });
}