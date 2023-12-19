function detectMobile() {
    let isMobile = RegExp(/Android|webOS|iPhone|iPod|iPad/i)
     .test(navigator.userAgent);
  
    if (!isMobile) {
      const isMac = RegExp(/Macintosh/i).test(navigator.userAgent);
  
      if (isMac && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
        isMobile = true;
      }
    }
    return isMobile;
}

//  reload the window on resizing the window - only on desktop
window.addEventListener('resize', () => {
    if (!detectMobile()){
        location.reload();
    }
})