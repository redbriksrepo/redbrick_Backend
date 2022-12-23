const salesHeadWeeklyReport = require("./shalesHeadWeaklyreport/shalesHeadWeeklyreport.sheduled");

const startSheduledTasks = () => {
    salesHeadWeeklyReport.start(); // sales head weekly report start;
}

module.exports = startSheduledTasks;