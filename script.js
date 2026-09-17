const form = document.getElementById("form");
const message = document.getElementById("message");

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const inputs = form.querySelectorAll(".inputBlock input");
    let allFilled = true;

    inputs.forEach(function (input) {
        if (input.value.trim() === "") {
            allFilled = false;
        }
    });

    if (!allFilled) {
        showMessage("Veuillez remplir tous les champs.", "error");
        return;
    }

    const email = document.getElementById("inputEmail").value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showMessage("L'email n'est pas valide.", "error");
        return;
    }

    const password = document.getElementById("inputPassword").value;
    const confirm = document.getElementById("inputConfirm").value;

    if (password !== confirm) {
        showMessage("Les mots de passe ne correspondent pas.", "error");
        return;
    }

    showRecap();
});

function showRecap() {
    document.getElementById("recapLogin").textContent = document.getElementById("inputText").value;
    document.getElementById("recapName").textContent = document.getElementById("inputName").value;
    document.getElementById("recapLastname").textContent = document.getElementById("inputLastname").value;
    document.getElementById("recapAddress").textContent = document.getElementById("inputAddress").value;
    document.getElementById("recapEmail").textContent = document.getElementById("inputEmail").value;
    document.getElementById("recapPhone").textContent = document.getElementById("inputPhone").value;
    document.getElementById("recapBirthdate").textContent = document.getElementById("inputBirthdate").value;

    form.hidden = true;
    document.getElementById("recap").hidden = false;
}
