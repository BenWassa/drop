// More complete quarter/date helpers (adapted from archive)
function getQuarterInfo(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    let week = Math.ceil(days / 7);
    let quarter, startDate, endDate;
    if (month < 3) { quarter = 1; startDate = new Date(year, 0, 1); endDate = new Date(year, 2, 31); }
    else if (month < 6) { quarter = 2; startDate = new Date(year, 3, 1); endDate = new Date(year, 5, 30); week -= 13; }
    else if (month < 9) { quarter = 3; startDate = new Date(year, 6, 1); endDate = new Date(year, 8, 30); week -= 26; }
    else { quarter = 4; startDate = new Date(year, 9, 1); endDate = new Date(year, 11, 31); week -= 39; }
    const options = { month: 'short', day: 'numeric' };
    return { quarter, year, week, startDate: startDate.toLocaleDateString(undefined, options), endDate: endDate.toLocaleDateString(undefined, options) };
}

function formatDate(d) {
    return d.toISOString().split('T')[0];
}

function getTodaysDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDates(date = new Date()) {
    const week = [];
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
        const current = new Date(startOfWeek);
        current.setDate(startOfWeek.getDate() + i);
        week.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
    }
    return week;
}

window.getQuarterInfo = getQuarterInfo;
window.formatDate = formatDate;
window.getTodaysDateString = getTodaysDateString;
window.getWeekDates = getWeekDates;
