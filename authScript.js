//Recuperation des elements du formulaire d'inscription
const form1 = document.getElementById('form1');
const userName = document.getElementById('user-name');
const userFirstName = document.getElementById('user-firstName');
const userEmail = document.getElementById('user-email');
const userPassword = document.getElementById('user-password');
const userPassword2 = document.getElementById('user-password2');

//Evenement
form1.addEventListener('submit', event => {
    event.preventDefault();

    const verify = formVerify();

    if(verify.isValid){
        signUser(verify.lastName, verify.firstName, verify.email, verify.password);
    }
    else{
        alert('Veuillez remplir correctement tous les champs');
    }
})


function formVerify(){
    let isValid = true; 

    const lastName = userName.value.trim();
    const firstName = userFirstName.value.trim();
    const email = userEmail.value.trim();
    const password = userPassword.value.trim();
    const password2 = userPassword2.value.trim();

    // lastName verification
    if (lastName === "") {
        isValid = false;
        let message = "Ce champs ne peut pas être vide!";
        setError(userName, message);
    }
    else if(lastName.length > 50){
        isValid = false;
        message = "Pas plus de 50 caractères!";
        setError(userName, message);
    }
    else{
        setSuccess(userName);
    }

    //firstName verification
    if (firstName === "") {
        isValid = false;
        let message = "Ce champs ne peut pas être vide!";
        setError(userFirstName, message);
    }
    else if(firstName.length > 50){
        isValid = false;
        message = "Pas plus de 50 caractères!";
        setError(userFirstName, message);
    }
    else{
        setSuccess(userFirstName);
    }

    //email verification
    if (email === "") {
        isValid = false;
        let message = "Ce champs ne peut pas être vide!";
        setError(userEmail, message);
    }    
    else if(emailVerificator(email) === false){
        isValid = false;
        let message = "Mauvais format de l'adresse email!";
        setError(userEmail, message);    
    }
    else{
        setSuccess(userEmail);  
    }

    //password verification
    if (password === "") {
        isValid = false;
        let message = "Ce champs ne peut pas être vide!";
        setError(userPassword, message);
    }   
    else if(password.length < 8){
        isValid = false;
        let message = "8 caractères minimun pour ce champs!";
        setError(userPassword, message);
    } 
    else{
        setSuccess(userPassword);  
    }

    //password2 verification
    if (password2 === "") {
        isValid = false;
        let message = "Ce champs ne peut pas être vide!";
        setError(userPassword2, message);
    }   
    else if(password2 !== password){
        isValid = false;
        let message = "confirmation invalide!";
        setError(userPassword2, message);
    } 
    else{
        setSuccess(userPassword2);  
    }

    return {isValid, lastName, firstName, email, password};
}


function setError(element, message) {
    const formInput = element.parentElement;
    const small = formInput.querySelector('small');

    //Ajout de message d'erreur
    small.innerText = message;

    //Ajout de la classe error
    formInput.className = 'form-input error'
}

function setSuccess(element) {
    const formInput = element.parentElement;

    //Ajout de la classe error
    formInput.className = 'form-input success'
}

function emailVerificator(email){
    return email.match(/^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/)
}

async function signUser(nom, prenom, email, password) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({nom, prenom, email, password }),
        });
        const data = await response.json();
        if (data.success) {
            alert(data.message);
            window.location.href = 'index.html';
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error(`Erreur lors de l/'inscription: `, error);
    }
}

//espression réguliere pour verifier l'email

// /^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/

