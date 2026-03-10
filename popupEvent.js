
function startCircleTimer(seconds) {
  const counter = document.getElementById("PUTimer");
  const tick = 100

  let remaining = seconds;
  let rot = 0;
  let vel = 0;

  function randAccel() {
        return (Math.random() - 0.5) * 0.6; 
  }


  const interval = setInterval(() => {
    remaining -= tick;
    
    vel += randAccel() * 0.1;   
    vel *= 0.92;                 
    rot += vel;

    counter.style.transform = `rotate(${rot * 360}deg)`;

    counter.textContent = (remaining/1000).toFixed(1);

    if (remaining <= 0) {
      clearInterval(interval);
      counter.textContent = "Ready!";
    }
  }, tick);
}


document.addEventListener('DOMContentLoaded', (event) => {
    const modalOverlay = document.getElementById('modalOverlay');
    const minPopupTime = 1500;
    const loadTime = new Date().getTime();

    startCircleTimer(minPopupTime)

    function closeModal() {
        modalOverlay.classList.add('hidden'); // Add the 'hidden' class to hide it
    }

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


