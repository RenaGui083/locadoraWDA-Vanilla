
function recSenha(){
var email = document.getElementById("email").value
var senha = document.getElementById("senha").value
var confirmSenha = document.getElementById("confirmarSenha").value
const inputs = document.getElementsByClassName("formInput");

if(email !== "" && senha !== "" && confirmSenha !== ""){
    window.location.href = "index.html"
}else{
///mensagem de erro
    document.getElementById("alert").innerHTML = "Os campos devem ser preenchidos!"
    document.getElementById("alert").style.color = "red"
///labels
    let labels = document.getElementsByClassName("formLabel")
    for (let i = 0; i < labels.length; i++) {
    labels[i].style.color = "red"
  }
///inputs
    for (let i = 0; i < inputs.length; i++) {
    inputs[i].style.boxShadow = "  0px 2px 0px #FF6347";
    inputs[i].addEventListener("input", function () {
      if (this.value.trim() !== "") {
        this.style.boxShadow = "";
        this.style.borderColor = "";
        this.style.color = "";
        labels[i].style.color = ""; 
    }
});
}
}
}