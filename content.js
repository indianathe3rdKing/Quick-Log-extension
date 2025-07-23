// document.addEventListener("selectionchange", (event) => {
//   const selection = event.target.value.substring(
//     event.target.selectionStart,
//     event.target.selectionEnd
//   );

//   setTimeout(() => {
//     if (selection) {
//       alert("Mouse event detected! Selected text: " + selection);
//     }
//   }, 1000);
// });

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
}

let mouseX = 0;
let mouseY = 0;
const letterRegex = /^[A-Za-z]+$/;
const spaceRegex = /\s/;

// Track mouse position
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const isValid = (regex, string) => {
  // Check if the string matches the regex
  return regex.test(string);
};

const handleSelection = () => {
  //Make unselectable text selectable
  document.body.style.userSelect = "text";
  const text = window.getSelection().toString().trim();

  if (isValid(letterRegex, text)) {
    fetchWordDefinition(text);
  } else if (isValid(spaceRegex, text)) {
    const index = text.search(spaceRegex);
    console.log("Space found at index:", index);
    if (isValid(letterRegex, text[index + 1])) {
      fetchWordDefinition(text);
    }
  } else {
    // Remove popup when selection is cleared
    document.getElementById("definitionPopup")?.remove();
  }
};

const fetchWordDefinition = async (word) => {
  try {
    const response = await fetch(
      `https://dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(
        word
      )}?key=e9299ad3-f9cc-4ecf-919e-55f25b2326a2`
    );

    const fallBackResponse = await fetch(
      `https://dictionaryapi.com/api/v3/references/sd4/json/${encodeURIComponent(
        word
      )}?key=4b8a85d3-2882-41c8-a3b9-c6756d7eeebb`
    );

    if (!response.ok) {
      response = fallBackResponse;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response text:", responseText);
      throw new Error("Invalid JSON response from API");
    }

    // Merriam-Webster API structure: data[0].shortdef contains the definitions
    const definitions = data[0].shortdef || [];

    if (definitions.length === 0) {
      throw new Error("No definitions available");
    }

    // Get all definitions as an array
    const definitionTexts = definitions
      .map((def, index) => `${index + 1}. ${def}`)
      .join("\n");

    console.log("All definitions:", definitionTexts);

    showPopup(word, definitionTexts);

    sendToPipedream({
      word,
      definitionTexts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Merriam-Webster API failed:", error);
    if (isValid(spaceRegex, word)) {
      showPopup(word, "Please select a valid word without spaces.");
    } else showPopup(word, "Definition not available. Please try again.");
  }
};

function showPopup(word, definitionTexts) {
  // Add Google Font if not already added
  if (
    !document.querySelector(
      'link[href*="fonts.googleapis.com/css2?family=Titillium+Web"]'
    )
  ) {
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }
  +(
    // Remove existing popup if it exists
    document.getElementById("definitionPopup")?.remove()
  );

  // Position popup at mouse cursor (offset slightly to avoid covering cursor)
  const popupX = mouseX + 10;
  const popupY = mouseY - 10;

  const modalHtml = `
    <div id="definitionPopup" style="position: fixed; top: ${popupY}px; left: ${popupX}px; background: #292a2d; border: 1px solidrgb(1, 10, 36); padding: 15px; z-index: 10000; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; max-width: 400px; font-family: 'Titillium Web', Arial, sans-serif; line-height: 1.4;">
    <h2 style="color: #cfd0d3; font-size: 18px; margin: 0 0 10px 0; font-weight: 600; font-family: 'Titillium Web', Arial, sans-serif; line-height: 1.3;text-transform:capitalize">Definition : ${word}</h2>
    <p style="white-space: pre-line; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0; color: #cfd0d3; font-family: 'Titillium Web', Arial, sans-serif; font-weight: 400;text-transform: capitalize;">${definitionTexts}</p>
    <button onclick="document.getElementById('definitionPopup').remove()" style="margin-top: 10px; padding: 8px 15px; background:rgb(6, 56, 136);outline:none; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-family: 'Titillium Web', Arial, sans-serif; font-weight: 600; line-height: 1.2;">Close</button>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function sendToPipedream(data) {
  fetch("https://eonn7e5d997c5tv.m.pipedream.net", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}

document.addEventListener("selectionchange", debounce(handleSelection, 1000));
