const menu = document.querySelector('.menu');

for (let i = 0; i < menuItems.length; i++) {
    let li = document.createElement('li');
    li.innerHTML = menuItems[i];
    menu.appendChild(li);
}

const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu'); 
    const options = dropdown.querySelectorAll('.menu li');
    const selected = dropdown.querySelector('.selected');
    selected.classList.add('selected');

    select.addEventListener('click', () => {
        select.classList.toggle('select-clicked'); 
        caret.classList.toggle('caret-rotate'); 
        menu.classList.toggle('menu-open');
    });

    let selectDateRange = document.getElementById("selected");
    let selectMenu = document.getElementById('select');
    
    function triggerChangeEvent() {
        const event = new Event('selectedChange');
        selectDateRange.dispatchEvent(event);
    }
    
    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;
            select.classList.remove('select-clicked');
            caret.classList.remove('caret-rotate');
            menu.classList.remove('menu-open');
            options.forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');

            triggerChangeEvent();
        });
    });
    
    
});
