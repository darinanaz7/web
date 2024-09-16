const title = document.querySelector('.form-title');
const alternateContainer = document.querySelector('.alternate-container');
const alternateText = alternateContainer.querySelector('p');
const alternateBtn = alternateContainer.querySelector('button');
const submitBtn = document.querySelector('.submit-btn');
const nameInput = document.querySelector('.name-input');
const passwordInput = document.querySelector('.password-input');
let authType = 'register';

alternateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if(authType === 'register') {
        authType = "login";
        alternateBtn.textContent = "Signup";
        alternateText.textContent = "Don't have an account?";
        title.textContent = "Login";
    } else {
        authType = "register";
        alternateBtn.textContent = "Login";
        alternateText.textContent = "Already have an account?";
        title.textContent = "Registration";
    }
});

const postData = async() => {
    try {
        const username = nameInput.value;
        const password = passwordInput.value;
        const response = await fetch('http://localhost:3003/auth/register', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password})
        });

        if(!response.ok) {
            const result = await response.text();
            alert(result);
            return;
        }
        alert('User has been created');
    } catch(err) {
        alert(err);
        console.error(err);
    }
}

const loginData = async() => {
    try {
        const username = nameInput.value;
        const password = passwordInput.value;
        const response = await fetch('http://localhost:3003/auth/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password})
        });

        if(!response.ok) {
            const result = await response.text();
            alert(result);
            return;
        }
        alert('User has been logged in');
    } catch(err) {
        alert(err);
        console.error(err);
    }
}

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if(authType === 'register') {
        postData();
    } else {
        loginData();
    }
});