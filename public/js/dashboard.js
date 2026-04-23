/* ==========================================
   BookSphere Dashboard
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardBooks();
    updateSlider();
});

/* ==========================================
   BOOK DATA
========================================== */

const books = [
{
    title: "Atomic Habits",
    author: "James Clear",
    image: "https://covers.openlibrary.org/b/id/12687884-L.jpg",
    key: "/works/OL27448W"
},
{
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "https://covers.openlibrary.org/b/id/240726-L.jpg",
    key: "/works/OL14986728W"
},
{
    title: "The Alchemist",
    author: "Paulo Coelho",
    image: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    key: "/works/OL82563W"
},
{
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    image: "https://covers.openlibrary.org/b/id/12918272-L.jpg",
    key: "/works/OL254293W"
},
{
    title: "Deep Work",
    author: "Cal Newport",
    image: "https://covers.openlibrary.org/b/id/8370221-L.jpg",
    key: "/works/OL17349859W"
}
];

/* ==========================================
   LOAD DASHBOARD
========================================== */

function loadDashboardBooks(){

    renderBooks("trendingBooks", books);
    renderBooks("recommendedBooks", books);
    renderBooks("newBooks", books);

    renderAuthors("topAuthors");
}

/* ==========================================
   BOOK CARDS
========================================== */

function renderBooks(id, data){

    const container = document.getElementById(id);

    if(!container) return;

    container.innerHTML = "";

    data.forEach(book => {

        container.innerHTML += `
        <a href="book.html?key=${encodeURIComponent(book.key)}" class="book-card">

            <img src="${book.image}" alt="${book.title}">

            <h4>${book.title}</h4>

            <p>${book.author}</p>

        </a>
        `;
    });
}

/* ==========================================
   AUTHORS
========================================== */

function renderAuthors(id){

    const container = document.getElementById(id);

    if(!container) return;

    container.innerHTML = `
    <div class="book-card">
        <img src="https://via.placeholder.com/220x280">
        <h4>James Clear</h4>
        <p>Self Growth</p>
    </div>

    <div class="book-card">
        <img src="https://via.placeholder.com/220x280">
        <h4>Jane Austen</h4>
        <p>Classic Author</p>
    </div>

    <div class="book-card">
        <img src="https://via.placeholder.com/220x280">
        <h4>Paulo Coelho</h4>
        <p>Motivation</p>
    </div>
    `;
}

/* ==========================================
   HERO SLIDER
========================================== */

let currentSlide = 0;

function moveSlide(step){

    const slides =
    document.querySelectorAll(".hero-slide");

    currentSlide += step;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    if(currentSlide < 0){
        currentSlide = slides.length - 1;
    }

    updateSlider();
}

function goSlide(index){

    currentSlide = index;

    updateSlider();
}

function updateSlider(){

    const track =
    document.getElementById("heroTrack");

    const dots =
    document.querySelectorAll(".dot");

    if(track){
        track.style.transform =
        `translateX(-${currentSlide * 100}%)`;
    }

    dots.forEach(dot =>
        dot.classList.remove("active")
    );

    if(dots[currentSlide]){
        dots[currentSlide]
        .classList.add("active");
    }
}

/* ==========================================
   AUTO SLIDE
========================================== */

setInterval(() => {
    moveSlide(1);
}, 4000);