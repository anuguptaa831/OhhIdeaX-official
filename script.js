

// --- 1. INITIALIZATION ---
// Lucide icons ko load karne ke liye
window.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

// --- 2. SELECTORS ---
const authForm = document.getElementById('auth-form');
const profileInput = document.getElementById('profile-pic');
const chosenImage = document.getElementById('chosen-image');
const defaultIcon = document.getElementById('default-icon');

// --- 3. IMAGE PREVIEW LOGIC ---
if (profileInput) {
    profileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                if (defaultIcon) defaultIcon.classList.add('hidden');
                chosenImage.src = e.target.result;
                chosenImage.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });
}

// --- 4. FORM SUBMISSION (Signup Logic) ---
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Signup process started...");

        // User data object
        const userData = {
            name: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            // URL fix: Backend port 5000 ke sath match kiya
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            console.log("Server Response:", data);

            if (response.ok) {
                alert("Success: Account created successfully! 🎉");

                localStorage.setItem('userName', userData.name);

                // Success ke baad dashboard par bhejein
                window.location.href = "dashboard.html";
            } else {
                alert("Error: " + (data.error || "Submission failed"));
            }
        } catch (error) {
            console.error("Critical Error:", error);
            alert("Network Error! Please check if your server is running on port 5000.");
        }
    });
}