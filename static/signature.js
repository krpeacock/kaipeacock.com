const max = 23;
// let initialCharacters = "sfck0pwtqhnx3dlwgrm6";
let initialCharacters = "";
// We'll store characters in a string instead of using the input field
let inputBuffer = "";
const poemDiv = document.querySelector("#poem");
const clearButton = document.querySelector("#clear");
const autoModeButton = document.querySelector("#auto-mode");

// Auto mode variables
let autoModeActive = false;
let autoModeInterval = null;
let autoModeTimeout = null;
const autoModeBaseDelay = 500; // Base delay (1 second)
const autoModeJitterRange = 400; // Additional random delay between 0-500ms
// All unique characters in the poem (for auto mode)
const poemUniqueChars = "'0nlyafterhomswigd31pc2u45kv'";

// Hide the original input field as we'll use terminal directly
const input = document.querySelector("#characters");
if (input) {
  input.style.display = "none";
}

// Create vintage terminal container
const terminalElement = document.getElementById('terminal');
const terminalContainer = document.createElement('div');
terminalContainer.className = 'terminal-container';
terminalElement.parentNode.insertBefore(terminalContainer, terminalElement);
terminalContainer.appendChild(terminalElement);

// Create scanline effect
const scanline = document.createElement('div');
scanline.className = 'scanline';
terminalContainer.appendChild(scanline);

// Center the terminal container
terminalContainer.style.margin = '20px auto';

// Determine font size based on screen width
function getResponsiveFontSize() {
  if (window.innerWidth <= 480) {
    return 10; // Smaller font for very small screens
  } else if (window.innerWidth <= 767) {
    return 12; // Medium font for small screens
  } else {
    return 14; // Normal font size for larger screens
  }
}

// Get responsive rows and columns based on screen size
function getResponsiveTerminalDimensions() {
  if (window.innerWidth <= 480) {
    return { rows: 25, cols: 45 }; // More rows on very small screens
  } else if (window.innerWidth <= 767) {
    return { rows: 24, cols: 50 }; // More rows on small screens
  } else {
    return { rows: 20, cols: 60 }; // Default for larger screens
  }
}

// Set up the terminal with vintage styling
var term = new Terminal({
  theme: {
    background: '#000000',
    foreground: '#33ff33',
    cursor: '#33ff33',
    cursorAccent: '#000000',
    selection: 'rgba(51, 255, 51, 0.3)'
  },
  fontFamily: 'Courier New, monospace',
  fontSize: getResponsiveFontSize(),
  cursorBlink: true,
  ...getResponsiveTerminalDimensions() // Use responsive dimensions
});

const terminalDiv = document.getElementById('terminal');

term.open(terminalDiv);

// Add a message to indicate the terminal is interactive
// Using multiple lines to ensure proper wrapping on small screens


const promptMsg = (()=>`>> Type letters and numbers to${window.innerWidth < 500 ? '\r\n  ' : ''} reveal the poem <<\r\n\r\n`)();

// Process keyboard input directly from terminal
term.onKey(function (e) {
  const key = e.key;
  const ev = e.domEvent;
  
  // If auto mode is active, any key press will stop it
  if (autoModeActive) {
    autoModeActive = false;
    clearInterval(autoModeInterval);
    autoModeInterval = null;
    clearTimeout(autoModeTimeout);
    autoModeTimeout = null;
    update();
    return;
  }
  
  // Handle printable characters (letters and numbers)
  if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
    // Add to our buffer
    if (inputBuffer.length >= max) {
      // Remove first character when buffer is full
      inputBuffer = inputBuffer.slice(1) + key.toLowerCase();
    } else {
      inputBuffer += key.toLowerCase();
    }
    
    // Update the poem visualization
    update();
  }
  // Handle Backspace
  else if (ev.keyCode === 8) {
    if (inputBuffer.length > 0) {
      // Remove the last character from the buffer
      inputBuffer = inputBuffer.slice(0, -1);
      
      // Update the display - which will automatically position cursor correctly
      update();
    }
  }
  // Handle Enter - update display with a new prompt
  else if (ev.keyCode === 13) {
    update(); // Redraw everything with proper prompt
  }
});

// We no longer need the input listener as we're handling keystrokes directly in the terminal
// Keep the terminal in focus for keyboard input
terminalContainer.addEventListener('click', () => {
  term.focus();
});

function update() {
  const poem = `0nly after
the forms     were signed
and seal3d

did 1 stop to consider
at age 32

1 would need to l34rn
to sign my 0wn name 4gain
5lowly
1ike a chi1d

love
kaia peacock`;
  const letters = [...initialCharacters, ...inputBuffer].slice(
    -1 * max
  );
  // Create a new rendered poem based on the current input
  const newPoem = [...poem].reduce((prev, next) => {
    if (next === "\n") {
      prev += "\r\n"; // Using \r\n instead of just \n for proper line breaks in xterm
    } else if (letters.includes(next.toLowerCase())) {
      prev += next;
    } else {
      prev += " ";
    }
    return prev;
  }, ``);
  
  // Clear the terminal completely
  term.clear();
  
  // Write the header message without any extra characters
  term.write(promptMsg);

  
  // // Then show the poem
  term.write(newPoem);
  
  // Add a line break and input prompt at the bottom
  term.write("\r\n\r\n");
}

// Toggle auto mode function
async function toggleAutoMode() {
  autoModeActive = !autoModeActive;
  
  // Update button appearance to show auto mode state
  if (autoModeButton) {
    if (autoModeActive) {
      autoModeButton.textContent = "Stop Auto";
      autoModeButton.classList.add("active");
    } else {
      autoModeButton.textContent = "Auto Mode";
      autoModeButton.classList.remove("active");
    }
  }
  
  if (autoModeActive) {
    // Function to type a single character with jitter
    const typeWithJitter = async () => {
      // Build a list of characters that aren't already in the input buffer
      const unusedChars = [...poemUniqueChars].filter(char => !inputBuffer.includes(char));
      
      // If all characters are already used, just pick a random one from the full set
      const charPool = unusedChars.length > 0 ? unusedChars : [...poemUniqueChars];
      
      // Get a random character from our filtered set
      const randomIndex = Math.floor(Math.random() * charPool.length);
      const randomChar = charPool[randomIndex];
      
      // Since we're in auto mode, directly update the buffer instead of
      // trying to trigger the terminal's key handler which could have side effects
      
      // Add to our buffer (same logic as manual typing)
      if (inputBuffer.length >= max) {
        // Remove first character when buffer is full
        inputBuffer = inputBuffer.slice(1) + randomChar.toLowerCase();
      } else {
        inputBuffer += randomChar.toLowerCase();
      }
      
      // Update the poem visualization
      update();
      
      // Only schedule next character if auto mode is still active
      if (autoModeActive) {
        // Calculate next delay with jitter
        const nextDelay = autoModeBaseDelay + Math.random() * autoModeJitterRange;
        autoModeTimeout = setTimeout(typeWithJitter, nextDelay);
      }
    };
    
    // Start the first character after a short delay
    autoModeTimeout = setTimeout(typeWithJitter, 500);
  
  } else {
    // Stop auto typing
    clearInterval(autoModeInterval);
    autoModeInterval = null;
    clearTimeout(autoModeTimeout);
    autoModeTimeout = null;
    update(); // Refresh display
  }
}

// Add auto mode activation with keyboard shortcut (press 'a' key)
document.addEventListener('keydown', (e) => {
  // Alt+A to toggle auto mode
  if (e.key === 'a' && e.altKey) {
    e.preventDefault(); // Prevent default action
    toggleAutoMode();
  }
});

// Add click handler for the auto mode button
if (autoModeButton) {
  autoModeButton.addEventListener("click", () => {
    toggleAutoMode();
    // Focus back on the terminal
    term.focus();
  });
}

clearButton.addEventListener("click", () => {
  // Stop auto mode if running
  if (autoModeActive) {
    autoModeActive = false;
    clearInterval(autoModeInterval);
    autoModeInterval = null;
    clearTimeout(autoModeTimeout);
    autoModeTimeout = null;
    
    // Reset auto mode button appearance
    if (autoModeButton) {
      autoModeButton.textContent = "Auto Mode";
      autoModeButton.classList.remove("active");
    }
  }
  
  initialCharacters = "";
  inputBuffer = "";
  update(); // Will redraw everything with the right structure
  
  // Focus back on the terminal
  term.focus();
});

// Add some vintage terminal boot effect
function vintageBootSequence() {
  term.clear();
  
  let bootText = [
    "SYSTEM INITIALIZE...",
    "LOADING MEMORY BANKS...",
    "ACCESSING ARCHIVES...",
    "TRANSING DATA...",
    "READY."
  ];
  
  let i = 0;
  const interval = setInterval(() => {
    if (i < bootText.length) {
      term.write(bootText[i] + "\r\n");
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        // Update will handle displaying the poem and prompt properly
        update(); 
        term.focus(); // Set focus on the terminal
      }, 1000);
    }
  }, 500);
}

// Function to handle window resize events and ensure terminal maintains aspect ratio
function handleResize() {
  // The CSS already handles the 4:3 aspect ratio
  // For xterm.js, we need to be careful not to trigger API calls that require integers
  try {
    // The CSS will handle most responsive sizing, just focus the terminal
    // to ensure it's still in an interactive state after resize
    term.focus();
  } catch (e) {
    console.error('Terminal focus error:', e);
  }
}

// Add resize event listener
window.addEventListener('resize', handleResize);

// Don't run handleResize on initial load since term.open already handles initial rendering
// This avoids potential timing issues with the API

// Run boot sequence and then update to show the poem
vintageBootSequence();
