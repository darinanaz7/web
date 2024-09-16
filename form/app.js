const title = document.querySelector('.form-title');
const alternateContainer = document.querySelector('.alternate-container');
const alternateText = alternateContainer.querySelector('p');
const alternateBtn = alternateContainer.querySelector('button');
const submitBtn = document.querySelector('.submit-btn');
const nameInput = document.querySelector('.name-input');
const passwordInput = document.querySelector('.password-input');
let authType = 'register';

alternateBtn.addEventListener('click', () => {
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
        const response = await fetch('http://localhost:3003/auth', {
            method: "POST",
            body: JSON.stringify({username, password})
        })
        alert('User has been created');
    } catch(err) {
        alert(err);
        console.error(err);
    }
}

submitBtn.addEventListener('click', () => {

})