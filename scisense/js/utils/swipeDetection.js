const swipeContainer = document.getElementById('swipe-container');
const prevButton = document.getElementById('prev-paper-button');
const nextButton = document.getElementById('next-paper-button');

let touchStartX = 0; // Starting X position of the touch
let touchEndX = 0;   // Ending X position of the touch

console.log('test js')

function setupSwipeNavigation(currentPaperId) {

  setupNavigation(currentPaperId); // Reuse your existing logic

  if (!swipeContainer) {
    console.warn('Swipe container not found');
    return;
  }

  // Attach touch event listeners
  swipeContainer.addEventListener('touchstart', handleTouchStart);
  console.log('Attached touchstart event listener');
  
  swipeContainer.addEventListener('touchmove', handleTouchMove);
  console.log('Attached touchmove event listener');
  
  swipeContainer.addEventListener('touchend', handleTouchEnd);
  console.log('Attached touchend event listener');
  
}

function handleTouchStart(e) {
  console.log('Touch Start Event Fired');
  touchStartX = e.changedTouches[0].screenX; // Capture starting X position
  console.log('Touch Start Position:', touchStartX);
}

function handleTouchMove(e) {
  console.log('Touch Move Event Fired');
  touchEndX = e.changedTouches[0].screenX; // Capture current X position during move
  console.log('Touch Move Position:', touchEndX);
}

function handleTouchEnd() {
  console.log('Touch End Event Fired');
  const swipeDistance = touchEndX - touchStartX;
  console.log('Swipe Distance:', swipeDistance);

  const swipeThreshold = 50; // Minimum distance for a valid swipe
  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      console.log('Swipe Detected: Right');
    } else {
      console.log('Swipe Detected: Left');
    }
  } else {
    console.log('Swipe Detected: Not far enough to register');
  }

  touchStartX = 0;
  touchEndX = 0; // Reset swipe positions
}

