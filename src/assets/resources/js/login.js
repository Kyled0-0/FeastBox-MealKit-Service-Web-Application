function email_change_validation(){
    const email = document.getElementById("loginEmail").value;
    const errorDisplay = document.getElementById("helpEmail");
    errorDisplay.textContent = '';

    
    if(email == null || email == "")//check if vacant
    {
        errorDisplay.append("Email Required");
        if(!errorDisplay.classList.contains("fst-italic","text-danger"))
            errorDisplay.classList.add("fst-italic","text-danger");
    }
    else if(!email.endsWith("@gmail.com"))
    {
        errorDisplay.append("Please enter a valid email");
        if(!errorDisplay.classList.contains("fst-italic","text-danger"))
            errorDisplay.classList.add("fst-italic","text-danger");
        
    }
    else
    {
        errorDisplay.append("Valid");
        errorDisplay.classList.remove("fst-italic","text-danger");
        if(!errorDisplay.classList.contains("text-success"))
            errorDisplay.classList.add("text-success");
        
    }
}

function password_change_validation(){
    const pass = document.getElementById("loginPassword").value;
    const errorDisplay = document.getElementById("helpPassword");
    errorDisplay.textContent = '';

    if(pass == null || pass == "")//check if vacant
    {
        errorDisplay.append("Password Required");
        if(!errorDisplay.classList.contains("fst-italic","text-danger"))
            errorDisplay.classList.add("fst-italic","text-danger");
    }
}