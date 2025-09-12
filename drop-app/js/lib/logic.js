function getQuarterInfo(date=new Date()){
    const month = date.getMonth();
    const quarter = Math.floor(month/3)+1;
    return {quarter, year: date.getFullYear()};
}

function formatDate(d){
    return d.toISOString().split('T')[0];
}

window.getQuarterInfo = getQuarterInfo;
window.formatDate = formatDate;
