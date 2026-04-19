function getDates(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth()+1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let hour = String(date.getHours()).padStart(2, '0');
    let minute = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');

    return {year, month, day, hour, minute, seconds}
}

function getCurrentWeek() {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when Sunday
    const currentWeekStartDate = new Date(currentDate.setDate(diff));
    const currentWeekEndDate = new Date();

    // Set hours, minutes, and seconds to 00:00:00
    currentWeekStartDate.setHours(0, 0, 0, 0);

    return [getDates(currentWeekStartDate), getDates(currentWeekEndDate)]
}

function getLastWeek() {
    const currentDate = new Date();
    const lastWeekStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
    const lastWeekEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    return [getDates(lastWeekStartDate), getDates(lastWeekEndDate)]
}

function getLastMonth() {
    const currentDate = new Date();
    const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Set hours, minutes, and seconds to 23:59:59
    lastMonthEndDate.setHours(23, 59, 59);

    return [getDates(lastMonthStartDate), getDates(lastMonthEndDate)]
}

function getCurrentMonth() {
    const currentDate = new Date();
    const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currentMonthEndDate = new Date();

    return [getDates(currentMonthStartDate), getDates(currentMonthEndDate)]
}