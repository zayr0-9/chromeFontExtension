// Function to apply the font while preserving the relative font sizes and Font Awesome icons
function applyFontOnly(font) {
  console.log(`Applying font: ${font}`); // Log the font being applied

  // Remove any previously injected styles to avoid duplicates
  const existingStyle = document.getElementById("font-changer-style");
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create a new style element
  const style = document.createElement("style");
  style.id = "font-changer-style";

  // Apply the font-family globally, but explicitly preserve Font Awesome icons
  style.innerHTML = `
    * { font-family: '${font}', sans-serif !important; }
    [class^="fa"], [class*=" fa-"] { font-family: 'FontAwesome' !important; }
  `;

  document.head.appendChild(style);
}

// Check if the current page is a Chrome internal page
if (
  window.location.protocol === "chrome:" ||
  window.location.protocol === "chrome-extension:"
) {
  console.log("Skipping internal Chrome page."); // Log skipping Chrome internal page
} else {
  console.log("Running content.js on", window.location.href); // Log that content.js is running

  // Wait for the DOM to be fully loaded before applying the font
  document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the global font from Chrome local storage
    chrome.storage.local.get("selectedFont", function (data) {
      const selectedFont = data.selectedFont || "Arial"; // Default font
      console.log(`Retrieved global font: ${selectedFont}`);

      // Apply the font without affecting the relative font sizes
      applyFontOnly(selectedFont);
    });
  });
}
