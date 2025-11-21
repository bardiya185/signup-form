function login() {
    bs2.style.display = "block";
    bs1.style.display = "none";
    backbtn.style.marginLeft = "0px";
    form.style.height = "330px";
    btn.style.marginTop = "10px";
    in3.style.display = "none";
    in4.style.display = "none";
    btn.innerHTML = "Login";
}

function sginup() {
    bs2.style.display = "none";
    bs1.style.display = "block";
    backbtn.style.marginLeft = "100px";
    form.style.height = "410px";
    in3.style.display = "block";
    in4.style.display = "block";
    btn.style.marginTop = "18px";
    btn.innerHTML = "Signup";
}