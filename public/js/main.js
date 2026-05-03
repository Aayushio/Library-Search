/* ==================================================
   BookSphere - main.js
   FULL OpenLibrary Conversion
================================================== */

document.addEventListener("DOMContentLoaded", () => {
    activeNav();
    setupSearchForms();

    loadHomeBooks();
    loadAuthors();

    initSearchPage();
    loadBookPage();
});

/* ==================================================
   ACTIVE NAV
================================================== */

function activeNav() {

    const current = window.location.pathname.split("/").pop();

    document.querySelectorAll("nav a").forEach(link => {

        const href = link.getAttribute("href");

        if (
            href === current ||
            (current === "" && href === "index.html")
        ) {
            link.classList.add("active");
        }

    });

}

/* ==================================================
   COMMON SEARCH FORMS
================================================== */

function setupSearchForms() {

    const forms = document.querySelectorAll(".search-form");

    forms.forEach(form => {

        form.addEventListener("submit", e => {

            e.preventDefault();

            const input = form.querySelector("input");

            const value = input.value.trim();

            if (value) {
                window.location.href =
                `search.html?q=${encodeURIComponent(value)}`;
            }

        });

    });

}

/* ==================================================
   HOME PAGE BOOKS
================================================== */

async function loadHomeBooks() {

    const box = document.getElementById("classicBooks");
    if (!box) return;

    box.innerHTML = `<p>Loading books...</p>`;

    try {

        const res = await fetch(
            `https://openlibrary.org/search.json?q=classic literature&limit=8`
        );

        const data = await res.json();

        const books = data.docs || [];

        box.innerHTML = "";

        books.forEach(book => {

            const title =
                book.title || "Unknown";

            const author =
                book.author_name
                ? book.author_name[0]
                : "Unknown Author";

            const img =
                book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                : `https://via.placeholder.com/200x260?text=No+Cover`;

            const key =
                book.key;

            box.innerHTML += `

            <a href="book.html?key=${encodeURIComponent(key)}" class="book-card">

                <img src="${img}" alt="${title}">

                <h4>${title}</h4>

                <p>${author}</p>

            </a>

            `;

        });

    } catch (error) {

        box.innerHTML = `<p>Unable to load books.</p>`;

    }

}

/* ==================================================
   HOME AUTHORS
================================================== */

function loadAuthors() {

    const row = document.getElementById("authorRow");
    if (!row) return;

    const authors = [

        {
            name: "Jane Austen",
            key: "/authors/OL24636A",
            img: "https://covers.openlibrary.org/a/olid/OL24636A-M.jpg"
        },

        {
            name: "William Shakespeare",
            key: "/authors/OL9388A",
            img: "https://covers.openlibrary.org/a/olid/OL9388A-M.jpg"
        },

        {
            name: "Charles Dickens",
            key: "/authors/OL24640A",
            img: "https://covers.openlibrary.org/a/olid/OL24640A-M.jpg"
        },

        {
            name: "Mark Twain",
            key: "/authors/OL18319A",
            img: "https://covers.openlibrary.org/a/olid/OL18319A-M.jpg"
        },

        {
            name: "Arthur Conan Doyle",
            key: "/authors/OL2622835A",
            img: "https://covers.openlibrary.org/a/olid/OL2622835A-M.jpg"
        },

        {
            name: "Rabindranath Tagore",
            key: "/authors/OL135313A",
            img: "https://covers.openlibrary.org/a/olid/OL135313A-M.jpg"
        }

    ];

    row.innerHTML = "";

    authors.forEach(author => {

        row.innerHTML += `

        <a href="author.html?key=${encodeURIComponent(author.key)}&name=${encodeURIComponent(author.name)}" class="author-card">

            <img src="${author.img}" alt="${author.name}">

            <h4>${author.name}</h4>

        </a>

        `;

    });

}

/* ==================================================
   SEARCH PAGE
================================================== */

function initSearchPage() {

    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);

    const query =
        params.get("q") || "classic books";

    const input =
        document.getElementById("searchInput");

    if (input) input.value = query;

    searchBooks(query);

}

/* ==================================================
   SEARCH BOOKS
================================================== */

async function searchBooks(query) {

    const grid =
        document.getElementById("booksGrid");

    if (!grid) return;

    grid.innerHTML =
    `<div class="loader">Searching...</div>`;

    try {

        const res = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=24`
        );

        const data = await res.json();

        const books =
            data.docs || [];

        const title =
            document.getElementById("resultTitle");

        const count =
            document.getElementById("resultCount");

        if (title)
            title.innerText =
            `Results for "${query}"`;

        if (count)
            count.innerText =
            `${books.length} Results`;

        if (books.length === 0) {

            grid.innerHTML = `
            <div class="empty-state">
                No results found.
            </div>`;
            return;
        }

        grid.innerHTML = "";

        books.forEach(book => {

            const title =
                book.title || "Unknown";

            const author =
                book.author_name
                ? book.author_name[0]
                : "Unknown";

            const img =
                book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                : `https://via.placeholder.com/220x290?text=No+Cover`;

            const year =
                book.first_publish_year || "N/A";

            const key =
                book.key;

            grid.innerHTML += `

            <a href="book.html?key=${encodeURIComponent(key)}" class="book-card">

                <img src="${img}" alt="${title}">

                <h3>${title}</h3>

                <p>${author}</p>

                <div class="meta">${year}</div>

            </a>

            `;

        });

    } catch (error) {

        grid.innerHTML = `
        <div class="empty-state">
            Search failed.
        </div>`;

    }

}

/* ==================================================
   BOOK PAGE
================================================== */

async function loadBookPage() {

    const app =
        document.getElementById("app");

    if (!app) return;

    const params =
        new URLSearchParams(window.location.search);

    const key =
        params.get("key");

    if (!key) {
        app.innerHTML =
        errorBox("No book selected.");
        return;
    }

    app.innerHTML =
    errorBox("Loading Book...");

    try {

        const res = await fetch(
            `https://openlibrary.org${key}.json`
        );

        const data = await res.json();

        renderBook(data);
        loadRelatedBooks(data);

    } catch (error) {

        app.innerHTML =
        errorBox("Unable to load book.");

    }

}

/* ==================================================
   RENDER BOOK
================================================== */

function renderBook(data) {

    const title =
        data.title || "Unknown";

    const desc =
        typeof data.description === "string"
        ? data.description
        : data.description?.value ||
          "No description available.";

    const cover =
        data.covers && data.covers.length
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
        : `https://via.placeholder.com/320x460?text=No+Cover`;

    document.title =
    `${title} | BookSphere`;

    document.getElementById("app").innerHTML = `

    <section class="book-page">

        <div class="book-grid">

            <div>
                <img src="${cover}" class="book-cover">
            </div>

            <div>

                <h1 class="book-title">${title}</h1>

                <p class="book-author">
                    Classic Library Collection
                </p>

                <p class="book-desc">${desc}</p>

                <div class="book-actions">

                    <a href="https://openlibrary.org${data.key}" target="_blank" class="btn">
                        Open Book
                    </a>

                </div>

            </div>

        </div>

    </section>
    `;

}

/* ==================================================
   RELATED
================================================== */

async function loadRelatedBooks(data) {

    const row =
        document.getElementById("relatedBooks");

    if (!row) return;

    try {

        const res = await fetch(
            `https://openlibrary.org/search.+?q=${encodeURIComponent(data.title)}&limit=6`
        );

        const json = await res.json();

        row.innerHTML = "";

        json.docs.forEach(book => {

            const img =
                book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : `https://via.placeholder.com/190x250`;

            row.innerHTML += `

            <a href="book.html?key=${encodeURIComponent(book.key)}" class="book-card">

                <img src="${img}">

                <h4>${book.title}</h4>

                <p>${book.author_name ? book.author_name[0] : ""}</p>

            </a>

            `;

        });

    } catch (error) {

        row.innerHTML =
        `<p>Unable to load related books.</p>`;

    }

}

/* ==================================================
   HELPERS
================================================== */

function errorBox(text) {

return `
<div style="
padding:100px;
text-align:center;
font-size:34px;
font-weight:700;
color:#7a4e1d;
">
${text}
</div>
`;

}
// dash board name

document.addEventListener("DOMContentLoaded", () => {

    const userRaw = localStorage.getItem("booksphere_user");

    if (userRaw) {
        try {
            const user = JSON.parse(userRaw);

            const name = user.name || "User";

            document.getElementById("dashboardName").innerText = name + " Dashboard";

        } catch (e) {
            console.log("Error reading user");
        }
    }

});