/* ===================================================
   BookSphere - auth.js
   Frontend authentication logic
   Handles:
   1. Login  → POST /api/login
   2. Signup → POST /api/signup
   3. Logout
   4. Session UI (show username / logout button)
=================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initLogin();
    initSignup();
    updateAuthUI();
});


/* ===================================================
   LOGIN
   Form id="loginForm"
=================================================== */

function initLogin() {

    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email    = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (!email || !password) {
            showMsg("Please fill all fields.", "error");
            return;
        }

        const btn = form.querySelector("button[type=submit]");
        btn.textContent = "Logging in...";
        btn.disabled = true;

        try {

            const res = await fetch("/api/login", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {

                /* Save session */
                localStorage.setItem("booksphere_token", data.token);
                localStorage.setItem("booksphere_user",  JSON.stringify(data.user));

                showMsg(data.message, "success");

                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 800);

            } else {

                showMsg(data.message || "Login failed.", "error");
                btn.textContent = "Login";
                btn.disabled = false;

            }

        } catch (err) {

            showMsg("Server error. Is the server running?", "error");
            btn.textContent = "Login";
            btn.disabled = false;

        }

    });

}


/* ===================================================
   SIGNUP
   Reader form id="readerForm"
   Author form id="authorForm"
=================================================== */

function initSignup() {

    const readerForm = document.getElementById("readerForm");
    const authorForm = document.getElementById("authorForm");

    if (readerForm) {
        readerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await signupUser({
                name:     document.getElementById("readerName").value.trim(),
                email:    document.getElementById("readerEmail").value.trim(),
                password: document.getElementById("readerPassword").value.trim(),
                role:     "reader"
            });
        });
    }

    if (authorForm) {
        authorForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await signupUser({
                name:     document.getElementById("authorName").value.trim(),
                email:    document.getElementById("authorEmail").value.trim(),
                password: document.getElementById("authorPassword").value.trim(),
                role:     "author"
            });
        });
    }

}


/* ===================================================
   COMMON SIGNUP REQUEST
=================================================== */

async function signupUser(userData) {

    if (!userData.name || !userData.email || !userData.password) {
        showMsg("Please fill all required fields.", "error");
        return;
    }

    try {

        const res = await fetch("/api/signup", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(userData)
        });

        const data = await res.json();

        if (data.success) {

            localStorage.setItem("booksphere_token", data.token);
            localStorage.setItem("booksphere_user",  JSON.stringify(data.user));

            showMsg(data.message, "success");

            setTimeout(() => {
                window.location.href = data.redirect;
            }, 800);

        } else {

            showMsg(data.message || "Signup failed.", "error");

        }

    } catch (err) {

        showMsg("Server error. Is the server running?", "error");

    }

}


/* ===================================================
   LOGOUT
=================================================== */

function logout() {
    localStorage.removeItem("booksphere_token");
    localStorage.removeItem("booksphere_user");
    window.location.href = "login.html";
}


/* ===================================================
   SESSION UI — update header login btn
=================================================== */

function updateAuthUI() {

    const token   = localStorage.getItem("booksphere_token");
    const userRaw = localStorage.getItem("booksphere_user");
    const loginBtn = document.querySelector(".login-btn");

    if (!loginBtn) return;

    if (token && userRaw) {

        try {
            const user = JSON.parse(userRaw);
            loginBtn.textContent = user.name ? user.name.split(" ")[0] : "Logout";
        } catch(e) {
            loginBtn.textContent = "Logout";
        }

        loginBtn.href = "#";
        loginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });

    } else {

        loginBtn.textContent = "Login";
        loginBtn.href = "login.html";

    }

}


/* ===================================================
   CHECK LOGIN
=================================================== */

function isLoggedIn() {
    return !!localStorage.getItem("booksphere_token");
}

function protectPage() {
    if (!isLoggedIn()) {
        alert("Please login first.");
        window.location.href = "login.html";
    }
}


/* ===================================================
   TOAST / MSG HELPER
=================================================== */

function showMsg(msg, type = "success") {

    let toast = document.getElementById("bs-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "bs-toast";
        toast.style.cssText = `
            position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
            padding:14px 28px; border-radius:12px; font-size:15px; font-weight:600;
            z-index:9999; transition:opacity .4s; box-shadow:0 8px 24px rgba(0,0,0,.15);
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.style.background = type === "success" ? "#7a4e1d" : "#c0392b";
    toast.style.color = "#fff";
    toast.style.opacity = "1";

    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.style.opacity = "0";
    }, 3000);

}