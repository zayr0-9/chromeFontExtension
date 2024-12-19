// Function to apply the font while preserving the relative font sizes
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

  // Apply the font-family without changing the existing font sizes
  style.innerHTML = `
    * { font-family: '${font}' !important; }
  `;

  document.head.appendChild(style);
}

// Check if the current page is a Chrome internal page
if (
  window.location.protocol === "chrome:" ||
  window.location.protocol === "chrome-extension:"
) {
  // console.log("Skipping internal Chrome page."); // Log skipping Chrome internal page
} else {
  // Log that content.js is running
  // console.log("Running content.js on", window.location.href);

  // Send a message to the background script to get the current tab ID
  chrome.runtime.sendMessage({ type: "getTabId" }, function (response) {
    // const tabId = response.tabId;
    // console.log(`Received tab ID: ${tabId}`);

    // Retrieve the global font from Chrome local storage
    chrome.storage.local.get("selectedFont", function (data) {
      const selectedFont = data.selectedFont || "Arial"; // Default font
      // console.log(`Retrieved global font: ${selectedFont}`);

      // Apply the font without affecting the relative font sizes
      applyFontOnly(selectedFont);
    });
  });
}
