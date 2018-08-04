document.addEventListener('DOMContentLoaded', (event) => {
    addEventToReviewSubmit();
});

addEventToReviewSubmit = () => {
    document.getElementById('add-review-submit').addEventListener('click', submitForm)
}

submitForm = () => {
    console.log('lol');
    console.log(DBHelper);
}