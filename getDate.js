
exports.getToday = getToday;
exports.getDate = getDate;

function getToday() {
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    return today.toLocaleDateString("en-US", options);
}

function getDate() {
    return ("its today stupid");
}