
document.addEventListener('DOMContentLoaded', (event) => {
    const modalOverlay = document.getElementById('modalOverlay');
    const minPopupTime = 1500; // 2sec
    const loadTime = new Date().getTime();

    function closeModal() {
        modalOverlay.classList.add('hidden'); // Add the 'hidden' class to hide it
    }

    // Add a click event listener to the entire document (window/body works too)
    // This will close the modal when any part of the page is clicked
    document.addEventListener('click', function(event) {
        // Check if the modal is currently visible before trying to close it
        if (!modalOverlay.classList.contains('hidden')) {
            var clickTime = new Date().getTime(); // Get the current timestamp
            var timeElapsed = clickTime - loadTime; // Calculate the elapsed time in milliseconds
            if (timeElapsed >= minPopupTime) closeModal();
        }
    });
});

