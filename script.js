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
    const recapContent = document.getElementById("recapContent");
    recapContent.innerHTML = "";

    form.querySelectorAll(".inputBlock").forEach(function (block) {
        const input = block.querySelector("input");

        // Le mot de passe ne doit pas apparaître dans le récapitulatif
        if (input.type === "password") {
            return;
        }

        const line = document.createElement("p");
        const label = document.createElement("strong");
        label.textContent = block.querySelector("label").textContent + " ";
        line.appendChild(label);
        // textContent et non innerHTML : la saisie ne doit pas être interprétée comme du HTML
        line.appendChild(document.createTextNode(input.value.trim()));
        recapContent.appendChild(line);
    });

    form.hidden = true;
    document.getElementById("recap").hidden = false;
}
