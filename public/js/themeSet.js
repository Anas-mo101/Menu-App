var theme = data.theme;
document.getElementById("resname").innerHTML = theme.rest_name; 
document.getElementById("logopic").setAttribute("src","http://localhost:3000/img/"+ theme.logo);
document.getElementById("body").setAttribute("style", "background: url(http://localhost:3000/img/" + theme.bckground + ") no-repeat center center fixed;");
let root = document.documentElement;
root.style.setProperty('--primary-color', theme.color_two);
root.style.setProperty('--secondary-color', theme.color_one);