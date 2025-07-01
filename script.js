let currentType = "story";
let isCreating = false;

// Writing type configurations
const writingTypes = {
  story: {
    icon: "📖",
    name: "Short Story",
    className: "story-content",
  },
  poem: {
    icon: "🎭",
    name: "Poetry",
    className: "poem-content",
  },
  dialogue: {
    icon: "💬",
    name: "Dialogue",
    className: "story-content",
  },
  script: {
    icon: "🎬",
    name: "Script",
    className: "script-content",
  },
  letter: {
    icon: "💌",
    name: "Letter",
    className: "story-content",
  },
  monologue: {
    icon: "🎤",
    name: "Monologue",
    className: "story-content",
  },
};

// Initialize type selection
document.addEventListener("DOMContentLoaded", function () {
  // Set up type card listeners
  document.querySelectorAll(".type-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectWritingType(card.dataset.type);
    });
  });

  updateTypeDisplay();
});

// Select writing type
function selectWritingType(type) {
  currentType = type;

  // Update UI
  document.querySelectorAll(".type-card").forEach((card) => {
    card.classList.remove("active");
  });
  document.querySelector(`[data-type="${type}"]`).classList.add("active");

  updateTypeDisplay();
}

// Update type display
function updateTypeDisplay() {
  const typeConfig = writingTypes[currentType];
  document.getElementById("currentTypeDisplay").textContent =
    `${typeConfig.icon} ${typeConfig.name} Mode`;
}

// Set inspiration
function setInspiration(text) {
  document.getElementById("theme").value = text;
  // Optional: Also trigger focus on the theme input
  document.getElementById("theme").focus();

  // Visual feedback
  const themeInput = document.getElementById("theme");
  themeInput.style.background = "#e3f2fd";
  setTimeout(() => {
    themeInput.style.background = "";
  }, 1000);
}

// Create writing
async function createWriting() {
  const apiKey = document.getElementById("apiKey").value.trim();
  const settings = getWritingSettings();

  // Validation
  if (!apiKey) {
    showError("Please enter your OpenAI API Key");
    return;
  }

  if (!settings.theme && !settings.characters) {
    showError("Please provide a theme or character description");
    return;
  }

  if (isCreating) return;

  // Show loading
  showLoading(true);
  isCreating = true;
  hideError();

  try {
    // Generate creative content
    const content = await callOpenAI(apiKey, settings);

    // Display the created content
    displayWriting(content, settings);
  } catch (error) {
    console.error("Error:", error);
    showError("Failed to create writing: " + error.message);
  } finally {
    showLoading(false);
    isCreating = false;
  }
}

// Get writing settings
function getWritingSettings() {
  return {
    type: currentType,
    theme: document.getElementById("theme").value.trim(),
    genre: document.getElementById("genre").value,
    tone: document.getElementById("tone").value,
    length: document.getElementById("length").value,
    characters: document.getElementById("characters").value.trim(),
  };
}

// Call OpenAI API
async function callOpenAI(apiKey, settings) {
  const prompt = buildCreativePrompt(settings);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a talented creative writer and poet. Create engaging, original, and imaginative content based on user specifications. Focus on vivid imagery, compelling characters, and emotional depth. Always deliver complete, polished creative works.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "API request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Build creative writing prompt
function buildCreativePrompt(settings) {
  const lengthMap = {
    short: "100-300 words",
    medium: "300-600 words",
    long: "600-1000 words",
    extended: "1000+ words",
  };

  let prompt = `Create a ${settings.type}`;

  if (settings.genre && settings.genre !== "any") {
    prompt += ` in the ${settings.genre} genre`;
  }

  prompt += ` with a ${settings.tone} tone`;
  prompt += ` that is ${lengthMap[settings.length]} long`;

  if (settings.theme) {
    prompt += `\n\nTheme/Topic: ${settings.theme}`;
  }

  if (settings.characters) {
    prompt += `\n\nCharacters/Elements: ${settings.characters}`;
  }

  // Type-specific instructions
  const typeInstructions = {
    story:
      "\n\nCreate a complete short story with a clear beginning, middle, and end. Include vivid descriptions, engaging dialogue, and a satisfying resolution.",
    poem: "\n\nWrite an original poem with creative use of language, imagery, and rhythm. Consider using poetic devices like metaphors, alliteration, or rhyme as appropriate.",
    dialogue:
      "\n\nWrite a compelling dialogue between characters that reveals personality, advances plot, or explores themes. Include minimal but effective action descriptions.",
    script:
      "\n\nFormat as a script with character names, dialogue, and stage directions. Include scene descriptions and character actions in proper script format.",
    letter:
      "\n\nWrite as a personal letter with authentic voice and emotion. Include appropriate greeting, body, and closing.",
    monologue:
      "\n\nCreate a dramatic monologue that reveals character depth and emotion. Write from a clear perspective with strong voice and personality.",
  };

  prompt += typeInstructions[settings.type] || "";

  return prompt;
}

// Display created writing
function displayWriting(content, settings) {
  const container = document.getElementById("outputContainer");
  const typeConfig = writingTypes[settings.type];
  const wordCount = countWords(content);

  container.innerHTML = `
                <div class="output-header">
                    <div class="output-title">${typeConfig.icon} ${typeConfig.name}</div>
                    <div class="output-actions">
                        <button class="action-btn" onclick="copyWriting()">📋 Copy</button>
                        <button class="action-btn" onclick="downloadWriting()">💾 Download</button>
                        <button class="action-btn" onclick="regenerateWriting()">🔄 Regenerate</button>
                    </div>
                </div>
                
                <div class="writing-content ${typeConfig.className}">
                    ${formatWritingContent(content, settings.type)}
                </div>
                
                <div class="genre-tags">
                    ${generateGenreTags(settings)}
                </div>
                
                <div class="word-count">
                    📊 ${wordCount} words
                </div>
                
                <div class="loading" id="loadingDiv">
                    <div class="typewriter">✍️</div>
                    <div class="loading-text">Crafting your creative content...<br>Channeling inspiration and imagination</div>
                </div>
            `;

  // Store current content for actions
  window.currentWriting = {
    content: content,
    settings: settings,
    wordCount: wordCount,
  };
}

// Format writing content based on type
function formatWritingContent(content, type) {
  if (type === "poem") {
    // Preserve line breaks for poetry
    return content.replace(/\n/g, "<br>");
  } else if (type === "script") {
    // Format script with proper spacing
    return content.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");
  } else {
    // Standard paragraph formatting
    return content
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(.+)$/gm, "<p>$1</p>")
      .replace(/<p><\/p>/g, "");
  }
}

// Generate genre tags
function generateGenreTags(settings) {
  const tags = [];

  if (settings.genre && settings.genre !== "any") {
    tags.push(settings.genre.charAt(0).toUpperCase() + settings.genre.slice(1));
  }

  if (settings.tone && settings.tone !== "neutral") {
    tags.push(settings.tone.charAt(0).toUpperCase() + settings.tone.slice(1));
  }

  tags.push(settings.length.charAt(0).toUpperCase() + settings.length.slice(1));

  return tags.map((tag) => `<span class="genre-tag">${tag}</span>`).join("");
}

// Count words
function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

// Copy writing to clipboard
async function copyWriting() {
  if (!window.currentWriting) return;

  const textContent = window.currentWriting.content;

  try {
    await navigator.clipboard.writeText(textContent);
    showCopySuccess();
  } catch (err) {
    // Fallback method
    const textArea = document.createElement("textarea");
    textArea.value = textContent;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        showCopySuccess();
      } else {
        throw new Error("Copy command failed");
      }
    } catch (copyErr) {
      document.body.removeChild(textArea);
      showError("Failed to copy writing. Please select and copy manually.");
    }
  }
}

// Show copy success feedback
function showCopySuccess() {
  const btns = document.querySelectorAll(".action-btn");
  const copyBtn = Array.from(btns).find((btn) =>
    btn.textContent.includes("Copy"),
  );

  if (copyBtn) {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "✅ Copied!";
    copyBtn.style.backgroundColor = "#27ae60";
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.backgroundColor = "#667eea";
    }, 2000);
  }
}

// Download writing as text file
function downloadWriting() {
  if (!window.currentWriting) return;

  const typeConfig = writingTypes[window.currentWriting.settings.type];
  const content = window.currentWriting.content;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${typeConfig.name.replace(/\s+/g, "_")}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Regenerate current writing
function regenerateWriting() {
  if (!window.currentWriting) return;
  createWriting();
}

// Show/hide loading
function showLoading(show) {
  document.getElementById("loadingDiv").style.display = show ? "flex" : "none";
  document.getElementById("createBtn").disabled = show;
}

// Show/hide error
function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  setTimeout(() => (errorDiv.style.display = "none"), 5000);
}

function hideError() {
  document.getElementById("errorMessage").style.display = "none";
}
