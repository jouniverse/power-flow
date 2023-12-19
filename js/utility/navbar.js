let navBar = document.querySelector('nav')

navBar.innerHTML = `<ul class="nav-menu">
<li class="logo"><a href="#"><img class="logo-img" src="./imgs/power-company-logo.svg" alt=""></a></li>
<li class="item"><a href="home.html">Home</a></li>
<li class="item">
    <a href="dashboard.html">Dashboard</a>
</li>
<li class="item">
    <a href="search.html">Search</a>
</li>
<li class="item"><a href="about.html">About</a></li>
<li class="toggle">
    <div class="bar-1"></div>
    <div class="bar-2"></div>
    <div class="bar-3"></div> 
</li>
</ul>`

const toggle = document.querySelector(".toggle");
const navMenu = document.querySelector(".nav-menu");
const item = document.querySelectorAll(".item");

/* toggle mobile menu */
function toggleMenu() {
  if (navMenu.classList.contains("active")) {
    navMenu.style.backgroundColor = '#23242a';
    navMenu.style.padding = '0 0 0 0'
    navMenu.classList.remove("active");
  } else {
    navMenu.classList.add("active");
    navMenu.style.backgroundColor = '#323741';
    navMenu.style.padding = '0 0 100vh 0'
  }
}

function toggleTransform() {
  toggle.classList.toggle("change");
}

toggle.addEventListener("click", () => {
    toggleMenu()
    toggleTransform()
});
