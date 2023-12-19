function deployBlock(event) {
  event.preventDefault();

  var theObject = this.getAttribute("href");
  var theBlock = document.querySelector(theObject);
  var finalHeight = theBlock.querySelector(".content-block").clientHeight;
  if (theBlock.classList.contains("block-display")) {
    theBlock.classList.remove("block-display");
    theBlock.style.maxHeight = 0;
  } else {
    theBlock.classList.add("block-display");
    theBlock.style.maxHeight = finalHeight + "px";
  }
  document.querySelector(theObject).classList.add("active");
}

document.querySelectorAll(".info-container").forEach(function(element) {
  element.addEventListener("click", deployBlock);
});

