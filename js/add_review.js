var addReviewSubmit;
var submitFormInterval;

document.addEventListener('DOMContentLoaded', (event) => {
    registerServiceWorker();
    addReviewSubmit = document.getElementById('add-review-submit');

    if(addReviewSubmit) {
        addEventToReviewSubmit();
    }
});

addEventToReviewSubmit = () => {
    addReviewSubmit.addEventListener('click', () => submitForm(onSubmit));
}

submitForm = (onSubmit, data, dbPromise) => {
    var form = document.getElementById("review-form");
    var formData;

    clearInterval(submitFormInterval);
    submitFormInterval = null;

    if(data) {
        data = JSON.parse(data);
        console.log('formData coming from data', data);

        formData = new FormData();
        formData.set('name', data.name);
        formData.set('rating', data.rating);
        formData.set('comments', data.comments);
        formData.set('restaurant_id', data.restaurant_id);

        dbPromise.then(function(db) {
            var tx = db.transaction('reviewForm', 'readwrite');
            var store = tx.objectStore('reviewForm');
            return store.delete('reviewForm');
        });

        DBHelper.postReview(onSubmit, formData);
    } else {
        formData = new FormData(form);

        if(formData.has('name') && formData.has('rating') && formData.has('comment')) {
            formData.set('restaurant_id', getParameterByName('id'));
            formData.append('comments', formData.get('comment'));
            formData.append('comments', '');

            DBHelper.postReview(onSubmit, formData);
        } else {
            addReviewSubmit.innerHTML = 'Fill all the fields first!';

            setTimeout(() => addReviewSubmit.innerHTML = 'Add', 2500);
        }
    }
}

onSubmit = (error, formData) => {
    if(!error) {
        addReviewSubmit.innerHTML = 'Added!';
        setTimeout(() => addReviewSubmit.innerHTML = 'Add', 2500);
    } else {
        cacheFormData(formData);
    }
}

cacheFormData = (formData) => {
    const dbPromise = idb.open('db', 2,
        function(upgradeDb) {
            const keyValStore = upgradeDb.createObjectStore('reviewForm');

            var data = {
                name: formData.get('name'),
                rating: formData.get('rating'),
                restaurant_id: formData.get('restaurant_id'),
                comments: formData.get('comments')
            };

            keyValStore.put(JSON.stringify(data), "reviewForm");
        },
        (event) => alert("Database error: " + event.target.errorCode)
    );

    dbPromise.then(function(db) {
        var tx = db.transaction('reviewForm', 'readonly');
        var store = tx.objectStore('reviewForm');
        return store.get('reviewForm');
    }).then(function(formData) {
        if(submitFormInterval) {
            clearInterval(submitFormInterval);
            submitFormInterval = null;
        }
        submitFormInterval = setInterval(() => submitForm(onSubmit, formData, dbPromise), 3000)
    });
}

getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed
            console.log('ServiceWorker registration failed: ', err);
        });
    }
}
