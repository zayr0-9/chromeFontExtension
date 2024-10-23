// Function to apply the font and font size
function applyFontAndSize(font, size) {
  console.log(`Applying font: ${font}, size: ${size}px`); // Log font and size being applied

  // Remove any previously injected styles to avoid duplicates
  const existingStyle = document.getElementById("font-changer-style");
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create a new style element
  const style = document.createElement("style");
  style.id = "font-changer-style";
  style.innerHTML = `* { font-family: '${font}' !important; font-size: ${size}px !important; }`;
  document.head.appendChild(style);
}

// Check if the current page is a Chrome internal page
if (
  window.location.protocol === "chrome:" ||
  window.location.protocol === "chrome-extension:"
) {
  console.log("Skipping internal Chrome page."); // Log skipping Chrome internal page
} else {
  // Log that content.js is running
  console.log("Running content.js on", window.location.href);

  // Send a message to the background script to get the current tab ID
  chrome.runtime.sendMessage({ type: "getTabId" }, function (response) {
    if (chrome.runtime.lastError) {
      console.error("Error getting tabId:", chrome.runtime.lastError.message);
      return;
    }

    const tabId = response.tabId;
    console.log(`Received tab ID: ${tabId}`);

    // Retrieve the global font from Chrome local storage
    chrome.storage.local.get("selectedFont", function (data) {
      const selectedFont = data.selectedFont || "Arial"; // Default font
      console.log(`Retrieved global font: ${selectedFont}`);

      // Send a message to the background to retrieve the font size for this tab
      chrome.runtime.sendMessage(
        { type: "getFontSize", tabId: tabId },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(
              "Error retrieving font size:",
              chrome.runtime.lastError.message
            );
            return;
          }

          const selectedFontSize = response.fontSize;
          console.log(
            `Retrieved font size for tab ${tabId}: ${selectedFontSize}px`
          );

          // Apply the font and font size for the current tab
          applyFontAndSize(selectedFont, selectedFontSize);
        }
      );
    });
  });
}
