chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getTabId") {
    // Get the current tab's ID and send it back
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      sendResponse({ tabId: tabId });
    });
    return true;
  }

  if (request.type === "getFontSize") {
    const fontSizeKey = `fontSize_${request.tabId}`;

    // Retrieve the font size from session storage
    chrome.storage.session.get([fontSizeKey], function (sessionData) {
      const fontSize = sessionData[fontSizeKey] || 16; // Default font size if none is saved
      sendResponse({ fontSize: fontSize });
    });
    return true; // Keeps the message channel open for asynchronous response
  }

  if (request.type === "setFontSize") {
    const fontSizeKey = `fontSize_${request.tabId}`;
    const fontSize = request.fontSize;

    // Save the font size in session storage for this tab
    chrome.storage.session.set({ [fontSizeKey]: fontSize }, function () {
      console.log(`Saved font size ${fontSize}px for tab ${request.tabId}`);
      sendResponse({ success: true });
    });
    return true;
  }
});
