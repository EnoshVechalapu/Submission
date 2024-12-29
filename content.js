const ASSET_URL = {
    "close": chrome.runtime.getURL("assets/delete.png"),
    "send": chrome.runtime.getURL("assets/play.png")
  };
  
  const CODING_DESC_CONTAINER_CLASS = "coding_desc_container__gdB9M";
  const AI_HELPER_BUTTON_ID = "ai-helper-button";
  const CHAT_CONTAINER_ID = "ai-helper-chat-container";
  
  const COLORS = {
    "blue": "#0058c3",
    "dark_blue": "#1b2841",
    "beige": "#febdba",
    "teal": "#04549c",
    "light_green": "#4dd655",
    "dark_green": "#17753d",
    "light_brown": "#d7953d",
    "dark_brown": "#28190e",
    "red": "#a33333",
    "lightgray": "#dfebee",
    "gray": "#639c94",
    "white": "#ffffff"
  };
  
  // content.js
  window.addEventListener("xhrDataFetched", (event) => {
    const data = event.detail;
    console.log("Received data in content.js:", data);
  });
  
  let lastPageVisited = "";
  
  const observer = new MutationObserver(() => {
    handleContentChange();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  function handleContentChange() {
    if (isPageChange()) handlePageChange();
  }
  
  function isPageChange() {
    const currentPage = window.location.pathname;
    if (currentPage === lastPageVisited) return false;
    lastPageVisited = currentPage;
    return true;
  }
  
  function handlePageChange() {
    if (onTargetPage()) {
      cleanUpPage();
      addInjectScript();
      addAIChatbotButton();
    }
  }
  
  function onTargetPage() {
    return window.location.pathname.startsWith("/problems/");
  }
  
  function cleanUpPage() {
    const existingButton = document.getElementById(AI_HELPER_BUTTON_ID);
    if (existingButton) existingButton.remove();
  
    const existingChatContainer = document.getElementById(CHAT_CONTAINER_ID);
    if (existingChatContainer) existingChatContainer.remove();
  }
  
  function addInjectScript() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject.js");
    document.documentElement.insertAdjacentElement("afterbegin", script);
    script.remove();
  }
  
  function getProblemDescription() {
    const descriptionElement = document.querySelector(".coding_desc__pltWY.problem_paragraph");
    return descriptionElement ? descriptionElement.innerText.trim() : "Problem description not found.";
  }
  
  function addAIChatbotButton() {
    const aiButton = document.createElement("button");
    aiButton.id = AI_HELPER_BUTTON_ID;
    aiButton.innerText = "AI Helper";
    aiButton.style.cssText = `
      background-color: ${COLORS["blue"]};
      color: white;
      border: none;
      border-radius: 5px;
      padding: 10px 15px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
      margin: 10px 0;
      transition: all 0.3s ease;
    `;
  
    aiButton.onmouseover = () => (aiButton.style.backgroundColor = COLORS["dark_blue"]);
    aiButton.onmouseleave = () => (aiButton.style.backgroundColor = COLORS["blue"]);
  
    aiButton.addEventListener("click", () => {
      if (!document.getElementById(CHAT_CONTAINER_ID)) {
        injectChatInterface(CHAT_CONTAINER_ID);
      }
  
      const problemDescription = getProblemDescription();
      const chatMessages = document.getElementById("chat-messages");
  
      if (chatMessages) {
        const problemMessageElement = document.createElement("div");
        problemMessageElement.style.cssText = `
          padding: 8px;
          margin: 5px;
          background-color: ${COLORS["lightgray"]};
          color: ${COLORS["black"]};
          border-radius: 5px;
          align-self: flex-start;
          max-width: 70%;
          word-wrap: break-word;
        `;
        problemMessageElement.innerText = `Problem: ${problemDescription}`;
        chatMessages.appendChild(problemMessageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });
  
    const positioningElements = document.getElementsByClassName(CODING_DESC_CONTAINER_CLASS);
    if (positioningElements.length === 0) return;
    const codingDescContainer = positioningElements[0];
    codingDescContainer.insertAdjacentElement("beforeend", aiButton);
  }
  
  function injectChatInterface(containerId) {
    const chatContainer = document.createElement("div");
    chatContainer.id = containerId;
    chatContainer.style.cssText = `
      width: 100%;
      height: 400px;
      display: flex;
      flex-direction: column;
      background-color: ${COLORS["white"]};
      box-shadow: 0px 2px rgba(0,0,0,0.22);
      border-radius: 20px;
      overflow: hidden;
    `;
  
    const chatHeader = document.createElement("div");
    chatHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: ${COLORS["blue"]};
      color: ${COLORS["beige"]};
      font-size: 16px;
      font-weight: bold;
    `;
    chatHeader.innerText = "AI Helper";
  
    const closeButton = document.createElement("img");
    closeButton.src = ASSET_URL["close"];
    closeButton.alt = "Close";
    closeButton.style.cssText = `
      width: 20px;
      height: 20px;
      cursor: pointer;
    `;
  
    closeButton.addEventListener("click", () => chatContainer.remove());
    chatHeader.appendChild(closeButton);
  
    const chatMessages = document.createElement("div");
    chatMessages.id = "chat-messages";
    chatMessages.style.cssText = `
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      background-color: ${COLORS["lightgray"]};
    `;
  
    const chatInputContainer = document.createElement("div");
    chatInputContainer.style.cssText = `
      display: flex;
      align-items: center;
      padding: 10px;
      background-color: ${COLORS["beige"]};
      border-top: 1px solid ${COLORS["lightgray"]};
    `;
  
    const chatInput = document.createElement("textarea");
    chatInput.id = "chat-input";
    chatInput.placeholder = "Type your message...";
    chatInput.rows = 2;
    chatInput.style.cssText = `
      flex: 1;
      padding: 10px;
      border-radius: 5px;
      outline: none;
      resize: none;
      background-color: ${COLORS["white"]};
      font-size: 14px;
      line-height: 1.4;
    `;
  
    const sendButton = document.createElement("img");
    sendButton.src = ASSET_URL["send"];
    sendButton.alt = "Send";
    sendButton.style.cssText = `
      width: 25px;
      height: 25px;
      margin-left: 10px;
      cursor: pointer;
    `;
    sendButton.addEventListener("click", () => handleSendMessage());
    chatInputContainer.appendChild(chatInput);
    chatInputContainer.appendChild(sendButton);
  
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatMessages);
    chatContainer.appendChild(chatInputContainer);
  
    const aiButton = document.getElementById(AI_HELPER_BUTTON_ID);
    aiButton.insertAdjacentElement("afterend", chatContainer);
  }
  
  async function sendMessageToAPI(userMessage) {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const API_KEY = ""; // Replace with your actual API key
  
    try {
      const payload = {
        contents: [
          {
            parts: [
              { text: userMessage }
            ]
          }
        ]
      };
  
      // Send the request
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      // Parse the JSON response
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Extract the AI response from the first candidate
      return data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0].text
        ? data.candidates[0].content.parts[0].text
        : "No response from the API.";
    } catch (error) {
      console.error("Error sending message to API:", error);
      return "An error occurred while connecting to the API.";
    }
  }
  
  async function handleSendMessage() {
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");
  
    // Get user message and problem description
    const userMessage = chatInput.value.trim();
    const problemDescription = getProblemDescription();
  
    if (!userMessage) return; // Don't send empty messages
  
    // Display user's message in the chat
    const userMessageElement = document.createElement("div");
    userMessageElement.style.cssText = `
      padding: 8px;
      margin: 5px;
      background-color: ${COLORS["blue"]};
      color: ${COLORS["white"]};
      border-radius: 5px;
      align-self: flex-end;
      max-width: 70%;
      word-wrap: break-word;
    `;
    userMessageElement.innerText = userMessage;
    chatMessages.appendChild(userMessageElement);
  
    // Clear the input
    chatInput.value = "";
  
    // Send the problem description and user message to the AI API
    const botReply = await sendMessageToAPI(`Problem: ${problemDescription}\n\n. Now i will send you some queries answer based on that User: ${userMessage} `);
  
    // Display bot's reply
    const botMessageElement = document.createElement("div");
    botMessageElement.style.cssText = `
      padding: 8px;
      margin: 5px;
      background-color: ${COLORS["beige"]};
      color: ${COLORS["black"]};
      border-radius: 5px;
      align-self: flex-start;
      max-width: 70%;
      word-wrap: break-word;
    `;
    botMessageElement.innerText = botReply;
    chatMessages.appendChild(botMessageElement);
  
    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  