function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

document.addEventListener("DOMContentLoaded", function () {
  let today = new Date();
  let formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  document.getElementById("currentDate").innerText = formattedDate;

  document.getElementById("instructionModal").style.display = "flex";
  document.querySelectorAll('.container input, .container textarea, #pdfButton, #emailButton, #wordButton').forEach(el => {
    el.disabled = true;
  });

  document.getElementById("darkModeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
});

function closeModal(type) {
  document.getElementById("instructionModal").style.display = "none";
  document.getElementById("accountTypeModal").style.display = "flex";

  if (type === "non-scheduled") {
    document.getElementById("topics")?.remove();
    document.querySelector("label[for='topics']")?.remove();
    document.getElementById("trainingType")?.remove();
    document.querySelector("label[for='trainingType']")?.remove();
    document.getElementById('pdfButton').disabled = false;
    document.getElementById('emailButton').disabled = false;
    document.getElementById('wordButton').disabled = false;
  }
}

function confirmAccountType() {
  const selectedType = document.querySelector('input[name="accountType"]:checked');
  if (!selectedType) return alert("Please select an account type.");

  document.getElementById("accountTypeModal").style.display = "none";
  document.querySelectorAll('.container input, .container textarea').forEach(el => el.disabled = false);
  validateForm();

  const defaults = {
    "Strategic": {
      attention: "District/ Area Manager\nDistrict/ Area Manager 1-Up",
      cc: "Account Executive\nAccount Executive 1-Up\nRecap Creator Direct Supervisor"
    },
    "Key": {
      attention: "District/ Area Manager\nDistrict/ Area Manager 1-Up",
      cc: "Account Executive\nAccount Executive 1-Up\nRecap Creator Direct Supervisor"
    },
    "Regional": {
      attention: "District/ Area Manager\nOwner",
      cc: "Account Executive\nAccount Executive 1-Up\nRecap Creator Direct Supervisor"
    },
    "Dealership": {
      attention: "Service Manager\nRegional Fixed Ops Director",
      cc: "Account Executive\nAccount Executive 1-Up\nRecap Creator Direct Supervisor"
    }
  };

  const selectedDefaults = defaults[selectedType.value];
  if (selectedDefaults) {
    let attentionField = document.getElementById("attention");
    let ccField = document.getElementById("cc");

    function applyPlaceholderStyle(field, text) {
      if (!field.value.trim()) {
        field.value = text;
        field.classList.add("placeholder");
      }
    }

    function removePlaceholderStyle(event) {
      if (event.target.classList.contains("placeholder")) {
        event.target.value = "";
        event.target.classList.remove("placeholder");
      }
    }

    function restorePlaceholderStyle(event, text) {
      if (!event.target.value.trim()) {
        event.target.value = text;
        event.target.classList.add("placeholder");
      }
    }

    applyPlaceholderStyle(attentionField, selectedDefaults.attention);
    applyPlaceholderStyle(ccField, selectedDefaults.cc);

    attentionField.addEventListener("focus", removePlaceholderStyle);
    ccField.addEventListener("focus", removePlaceholderStyle);
    attentionField.addEventListener("blur", (e) => restorePlaceholderStyle(e, selectedDefaults.attention));
    ccField.addEventListener("blur", (e) => restorePlaceholderStyle(e, selectedDefaults.cc));
  }
}

function validateForm() {
  const inputs = document.querySelectorAll('.container input, .container textarea');
  const allFilled = Array.from(inputs).every(input => input.value.trim() !== "");
  document.getElementById('pdfButton').disabled = !allFilled;
  document.getElementById('emailButton').disabled = !allFilled;
  document.getElementById('wordButton').disabled = !allFilled;
}

document.querySelectorAll('.container input, .container textarea').forEach(el => {
  el.addEventListener("input", validateForm);
});

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function generatePDF() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  const fieldMap = [
    ["pdfDate", dateStr],
    ["pdfAccountName", getValue("accountName")],
    ["pdfAttention", getValue("attention")],
    ["pdfCC", getValue("cc")],
    ["pdfAudienceName", getValue("audienceName")],
    ["pdfOpening", getValue("opening")],
    ["pdfLocations", getValue("locations")],
    ["pdfTopics", getValue("topics")],
    ["pdfTrainingType", getValue("trainingType")],
    ["pdfAchievements", getValue("achievements")],
    ["pdfOpportunities", getValue("opportunities")],
    ["pdfFollowUps", getValue("followUps")],
    ["pdfClosing", getValue("closing")],
  ];

  fieldMap.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  const pdfElement = document.getElementById("pdfLetter");
  if (!pdfElement) return alert("Missing PDF layout.");

  const previousStyle = pdfElement.style.cssText;
  pdfElement.style.position = "static";
  pdfElement.style.visibility = "visible";

  const defaultFileName = `1 Recap for ${dateStr}.pdf`;
  const fileName = prompt(`Use default filename?\n\"${defaultFileName}\"`, defaultFileName) || defaultFileName;

  const options = {
    margin: 0.5,
    filename: fileName.endsWith(".pdf") ? fileName : fileName + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
  };

  setTimeout(() => {
    html2pdf()
      .set(options)
      .from(pdfElement)
      .toPdf()
      .get("pdf")
      .then(pdf => {
        pdf.save();
        pdfElement.style.cssText = previousStyle;
      })
      .catch(err => {
        console.error("PDF generation error:", err);
        alert("There was an error generating the PDF.");
        pdfElement.style.cssText = previousStyle;
      });
  }, 200);
}

function sendEmail() {
  const audienceEmail = getValue("attention");
  const ccEmails = getValue("cc");
  const audienceName = getValue("audienceName");
  const topics = getValue("topics").split("\n").map(t => "• " + t).join("\n");
  const achievements = getValue("achievements").split("\n").map(a => "• " + a).join("\n");

  const subject = `Valvoline FTS Recap for ${getValue("accountName")}`;
  let body = `Hello ${audienceName},\n\nThanks for your time this week, below are a few high‑level notes from my visits. My detailed notes can be found in the attached PDF.\n\n`;

  if (topics) body += "Topics Covered:\n" + topics + "\n\n";
  if (achievements) body += "Key Achievements:\n" + achievements + "\n\n";

  body += "Thank you for your partnership with Valvoline. Please let me know if you have any other questions.";

  const mailtoLink = `mailto:${encodeURIComponent(audienceEmail)}?cc=${encodeURIComponent(ccEmails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
}

async function generateWord() {
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  try {
    const response = await fetch("https://raw.githubusercontent.com/nfmcglinchey/Recap/main/Example.docx");
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new window.docxtemplater().loadZip(zip);

    doc.setData({
      date: dateStr,
      accountName: getValue("accountName"),
      attention: getValue("attention"),
      cc: getValue("cc"),
      audienceName: getValue("audienceName"),
      locations: getValue("locations"),
      topics: getValue("topics"),
      trainingType: getValue("trainingType"),
      achievements: getValue("achievements"),
      opportunities: getValue("opportunities"),
      followUps: getValue("followUps"),
      //fts_name: "ftsName"
    });

    doc.render();

    const blob = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    const fileName = `1 Recap for ${dateStr}.docx`;
    saveAs(blob, fileName);
  } catch (error) {
  console.error("Word generation failed:", error);

  if (error.properties && Array.isArray(error.properties.errors)) {
    const errorMessages = error.properties.errors.map(e => {
      const tag = e.properties.id || "(unknown tag)";
      const message = e.properties.explanation || "No explanation available.";
      return `Tag: ${tag}\nMessage: ${message}`;
    }).join("\n\n");

    alert("Docx template error:\n\n" + errorMessages);
  } else {
    alert("Unexpected error creating Word file. Check the console for details.");
  }
}
}
