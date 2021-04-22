
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
//below is not working
// const getToday = function() {
//     let today = new Date();
//     let options = {
//         weekday: "long",
//         day: "numeric",
//         month: "long"
//     };
//     return today.toLocaleDateString("en-US", options);
// }

// const getDate = function() {
//     return ("its today stupid");
// }