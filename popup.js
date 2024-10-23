document.addEventListener("DOMContentLoaded", function () {
  const fontSelect = document.getElementById("fontSelect");
  const fontSizeSlider = document.getElementById("fontSize");
  const fontSizeValue = document.getElementById("fontSizeValue");
  const resetFontSizeButton = document.getElementById("resetFontSize");
  const customFontInput = document.getElementById("customFontLink");
  const addFontButton = document.getElementById("addFont");
  const errorMessage = document.createElement("p");
  errorMessage.style.color = "red";
  errorMessage.style.display = "none";
  document.body.appendChild(errorMessage);

  const defaultFontSize = 16; // Default font size

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

          // Load the font size for this tab from session storage
          const fontSizeKey = `fontSize_${tabId}`;
          chrome.storage.session.get([fontSizeKey], function (sessionData) {
            const currentFontSize = sessionData[fontSizeKey] || defaultFontSize;
            fontSizeSlider.value = currentFontSize;
            fontSizeValue.textContent = `${currentFontSize}px`;

            // Apply the current font and tab-specific size to the active tab
            adjustFontInRealTime(fontSelect.value, currentFontSize, tabId);
          });
        }
      );
    });

    // Real-time font size update when the slider is moved
    fontSizeSlider.addEventListener("input", function () {
      const selectedFontSize = fontSizeSlider.value;
      fontSizeValue.textContent = `${selectedFontSize}px`;

      const selectedFont = fontSelect.value;
      // Apply the font size in real time for the current tab
      adjustFontInRealTime(selectedFont, selectedFontSize, tabId);

      // Save the font size specific to the current tab in session storage
      const fontSizeKey = `fontSize_${tabId}`;
      chrome.storage.session.set(
        { [fontSizeKey]: selectedFontSize },
        function () {
          console.log(`Saved font size ${selectedFontSize}px for tab ${tabId}`);
        }
      );
    });

    // Save the selected font globally
    document
      .getElementById("changeFont")
      .addEventListener("click", function () {
        const selectedFont = fontSelect.value;

        // Save the selected font in local storage (shared across all tabs)
        chrome.storage.local.set({ selectedFont: selectedFont }, function () {
          console.log(`Saved global font: ${selectedFont}`);
        });

        // Apply the selected font and font size to the current tab
        const selectedFontSize = fontSizeSlider.value;
        adjustFontInRealTime(selectedFont, selectedFontSize, tabId);
      });

    // Reset the font size to default for the current tab
    resetFontSizeButton.addEventListener("click", function () {
      fontSizeSlider.value = defaultFontSize;
      fontSizeValue.textContent = `${defaultFontSize}px`;

      // Save the default font size for this tab in session storage
      const fontSizeKey = `fontSize_${tabId}`;
      chrome.storage.session.set(
        { [fontSizeKey]: defaultFontSize },
        function () {
          console.log(`Reset to default font size for tab ${tabId}`);
        }
      );

      // Apply the default font size to the current tab
      const selectedFont = fontSelect.value;
      adjustFontInRealTime(selectedFont, defaultFontSize, tabId);
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
      chrome.storage.local.set({ customFonts: customFonts }, function () {
        console.log(`Custom font ${fontName} added and saved.`);
      });
    });

    // Clear the input field after adding
    customFontInput.value = "";
  });

  // Function to inject the current font and size into the active tab
  function adjustFontInRealTime(font, size, tabId) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: (font, size) => {
        // Remove the previous style if exists
        let style = document.getElementById("font-changer-style");
        if (!style) {
          style = document.createElement("style");
          style.id = "font-changer-style";
          document.head.appendChild(style);
        }
        style.innerHTML = `* { font-family: '${font}' !important; font-size: ${size}px !important; }`;
      },
      args: [font, size],
    });
  }

  // Function to validate the Google Fonts URL
  function isValidGoogleFontsLink(url) {
    const validPattern =
      /^https:\/\/fonts\.googleapis\.com\/css2\?family=[^&]+/;
    return validPattern.test(url); // Returns true if the link matches the Google Fonts pattern
  }
});
