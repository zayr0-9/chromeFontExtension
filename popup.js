document.addEventListener("DOMContentLoaded", function () {
  const fontSelect = document.getElementById("fontSelect");
  const customFontInput = document.getElementById("customFontLink");
  const addFontButton = document.getElementById("addFont");
  const errorMessage = document.createElement("p");
  errorMessage.style.color = "red";
  errorMessage.style.display = "none";
  document.body.appendChild(errorMessage);

  // Font Awesome Unicode range to exclude (e.g., \f000 - \f2ff)
  const fontAwesomeUnicodeRange = /^\\f[0-9a-fA-F]{3}$/;

  // Get the current tab's ID
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;

    // Retrieve system fonts and populate dropdown
    chrome.fontSettings.getFontList(function (fonts) {
      fonts.forEach(function (font) {
        const option = document.createElement("option");
        option.value = font.fontId;
        option.textContent = font.displayName;
        fontSelect.appendChild(option);
      });

      // Load saved custom fonts and global font from local storage
      chrome.storage.local.get(
        ["customFonts", "selectedFont"],
        function (data) {
          if (data.customFonts) {
            data.customFonts.forEach(function (font) {
              const option = document.createElement("option");
              option.value = font.fontId;
              option.textContent = font.displayName;
              fontSelect.appendChild(option);
            });
          }

          // Set the global font across all tabs
          if (data.selectedFont) {
            fontSelect.value = data.selectedFont;
          }

          // Apply the current font to the active tab
          applyFontInRealTime(fontSelect.value, tabId);
        }
      );
    });

    // Save the selected font globally
    document
      .getElementById("changeFont")
      .addEventListener("click", function () {
        const selectedFont = fontSelect.value;

        // Save the selected font in local storage (shared across all tabs)
        chrome.storage.local.set({ selectedFont: selectedFont });

        // Apply the selected font to the current tab
        applyFontInRealTime(selectedFont, tabId);
      });
  });

  // Handle "Add Font" button click
  addFontButton.addEventListener("click", function () {
    const fontLink = customFontInput.value.trim();

    // Reset any previous error messages
    errorMessage.textContent = "";
    errorMessage.style.display = "none";

    // Validate the font link
    if (!isValidGoogleFontsLink(fontLink)) {
      errorMessage.textContent =
        "Invalid Google Fonts URL. Please enter a valid link.";
      errorMessage.style.display = "block";
      return; // Stop the process if the URL is invalid
    }

    // Extract the font name from the URL (e.g., "family=Roboto" -> "Roboto")
    const fontName = fontLink.match(/family=([^&]*)/)[1].replace(/\+/g, " ");

    // Check for conflicts with Font Awesome Unicode range
    if (fontAwesomeUnicodeRange.test(fontName)) {
      errorMessage.textContent =
        "Font conflicts with Font Awesome icons. Please choose a different font.";
      errorMessage.style.display = "block";
      return;
    }

    // Create a new option in the dropdown for this custom font
    const option = document.createElement("option");
    option.value = `custom:${fontLink}`; // Custom prefix to identify user-added fonts
    option.textContent = `${fontName} (Custom)`;
    fontSelect.appendChild(option);

    // Save the custom font in Chrome storage
    chrome.storage.local.get("customFonts", function (data) {
      const customFonts = data.customFonts || [];
      customFonts.push({
        fontId: `custom:${fontLink}`,
        displayName: `${fontName} (Custom)`,
      });

      // Update storage with the new custom font
      chrome.storage.local.set({ customFonts: customFonts });
    });

    // Clear the input field after adding
    customFontInput.value = "";
  });

  // Function to inject the current font into the active tab
  function applyFontInRealTime(font, tabId) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: (font) => {
        // Remove the previous style if it exists
        let style = document.getElementById("font-changer-style");
        if (!style) {
          style = document.createElement("style");
          style.id = "font-changer-style";
          document.head.appendChild(style);
        }
        style.innerHTML = `  body, p, h1, h2, h3 {
                font-family: '${font}' !important;
              }`;
      },
      args: [font],
    });
  }

  // Function to validate the Google Fonts URL
  function isValidGoogleFontsLink(url) {
    const validPattern =
      /^https:\/\/fonts\.googleapis\.com\/css2\?family=[^&]+/;
    return validPattern.test(url); // Returns true if the link matches the Google Fonts pattern
  }
});
