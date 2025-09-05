const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const toggleText = document.getElementById('toggle-text');
const toggleLink = document.getElementById('toggle-link');
const formSubtitle = document.getElementById('form-subtitle');

toggleLink.addEventListener('click', function (e) {
    e.preventDefault();
    if (loginForm.style.display === 'none') {
        // Show login, hide signup
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign Up</a>`;
        formSubtitle.textContent = 'Your Gateway to Intelligent Learning';
    } else {
        // Show signup, hide login
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Login</a>`;
        formSubtitle.textContent = 'Create your account to start learning';
    }
    // Re-attach event listener to new link
    document.getElementById('toggle-link').addEventListener('click', arguments.callee);
});

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // Basic validation could be added here
    alert('Login successful! Redirecting to dashboard...');
    // Redirect or further logic here
});

signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    alert('Sign Up successful! Please login.');
    // Switch to login form after signup
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign Up</a>`;
    formSubtitle.textContent = 'Your Gateway to Intelligent Learning';
    // Re-attach event listener to new link
    document.getElementById('toggle-link').addEventListener('click', function (e) {
        e.preventDefault();
        toggleLink.click();
    });
});