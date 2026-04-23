/* ==========================================
   BookSphere - book.js
   OpenLibrary Version
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadBookPage();
});

/* ==========================================
   MAIN LOAD
========================================== */

async function loadBookPage() {

    const app = document.getElementById("app");
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");

    if (!key) {
        app.innerHTML = stateBox("No book selected.");
        return;
    }

    app.innerHTML = stateBox("Loading book...");

    try {

        const res = await fetch(
            `https://openlibrary.org${key}.json`
        );

        const data = await res.json();

        renderBook(data);
        loadRelatedBooks(data.title);

    } catch (error) {

        app.innerHTML = stateBox("Unable to load book.");

    }
}

/* ==========================================
   RENDER BOOK
========================================== */

function renderBook(data) {

    const title =
        data.title || "Unknown Title";

    const desc =
        typeof data.description === "string"
            ? data.description
            : data.description?.value ||
              "No description available.";

    const cover =
        data.covers && data.covers.length
            ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
            : "https://via.placeholder.com/320x460?text=No+Cover";

    const subjects =
        data.subjects && data.subjects.length
            ? data.subjects.slice(0, 4).join(", ")
            : "Literature";

    document.title = `${title} | BookSphere`;

    document.getElementById("app").innerHTML = `

    <section class="book-page">

        <div class="book-grid">

            <div>
                <img src="${cover}" class="book-cover" alt="${title}">
            </div>

            <div>

                <h1 class="book-title">${title}</h1>

                <p class="book-author">
                    OpenLibrary Collection
                </p>

                <p class="book-desc">${desc}</p>

                <div class="meta-grid">

                    <div class="meta-card">
                        <span>Subjects</span>
                        <strong>${subjects}</strong>
                    </div>

                    <div class="meta-card">
                        <span>Source</span>
                        <strong>OpenLibrary</strong>
                    </div>

                </div>

                <div class="book-actions">

                    <a 
                    href="https://openlibrary.org${data.key}" 
                    target="_blank"
                    class="btn">
                    Open Book
                    </a>

                    <a 
                    href="search.html?q=${encodeURIComponent(title)}"
                    class="btn">
                    Similar Books
                    </a>

                </div>

            </div>

        </div>

    </section>
    `;
}

/* ==========================================
   RELATED BOOKS
========================================== */

async function loadRelatedBooks(title) {

    const row = document.getElementById("relatedBooks");
    if (!row) return;

    row.innerHTML = `<p>Loading related books...</p>`;

    try {

        const res = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=8`
        );

        const data = await res.json();
        const books = data.docs || [];

        row.innerHTML = "";

        books.forEach(book => {

            const name =
                book.title || "Unknown";

            const author =
                book.author_name
                    ? book.author_name[0]
                    : "Unknown Author";

            const img =
                book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "https://via.placeholder.com/190x250?text=No+Cover";

            row.innerHTML += `

            <a href="book.html?key=${encodeURIComponent(book.key)}" class="book-card">

                <img src="${img}" alt="${name}">

                <h4>${name}</h4>

                <p>${author}</p>

            </a>
            `;
        });

    } catch (error) {

        row.innerHTML = `<p>Unable to load related books.</p>`;

    }
}

/* ==========================================
   HELPER
========================================== */

function stateBox(text) {

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