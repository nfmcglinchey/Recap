
function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Set the current date in the header when DOM loads
document.addEventListener("DOMContentLoaded", function () {
  let today = new Date();
  let formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  document.getElementById("currentDate").innerText = formattedDate;

  document.getElementById("instructionModal").style.display = "flex";
  document.querySelectorAll('.container input, .container textarea, #emailButton, #wordButton').forEach(el => {
    el.disabled = true;
  });
});

function closeModal(type) {
  document.getElementById("instructionModal").style.display = "none";
  document.getElementById("accountTypeModal").style.display = "flex";

  if (type === "non-scheduled") {
    document.getElementById("topics")?.remove();
    document.getElementById("trainingType")?.remove();
    document.getElementById("pdfButton").disabled = false;
    document.getElementById("emailButton").disabled = false;
    document.getElementById("wordButton").disabled = false;
  }
}

function confirmAccountType() {
  let selectedType = document.querySelector('input[name="accountType"]:checked');
  if (!selectedType) {
    alert("Please select an account type.");
    return;
  }

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
    document.getElementById("attention").value = selectedDefaults.attention;
    document.getElementById("cc").value = selectedDefaults.cc;
  }
}

function validateForm() {
  const inputs = document.querySelectorAll('.container input, .container textarea');
  const allFilled = Array.from(inputs).every(input => input.value.trim() !== "");
    document.getElementById('emailButton').disabled = !allFilled;
  document.getElementById('wordButton').disabled = !allFilled;
}

document.querySelectorAll('.container input, .container textarea').forEach(el => {
  el.addEventListener("input", validateForm);
});

function generatePDF() {
  const date = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  document.getElementById("pdfDate").textContent = date;
  document.getElementById("pdfAccountName").textContent = document.getElementById("accountName").value;
  document.getElementById("pdfAttention").textContent = document.getElementById("attention").value;
  document.getElementById("pdfCC").textContent = document.getElementById("cc").value;
  document.getElementById("pdfAudienceName").textContent = document.getElementById("audienceName").value;
  document.getElementById("pdfOpening").textContent = document.getElementById("opening").value;
  document.getElementById("pdfLocations").textContent = document.getElementById("locations").value;
  document.getElementById("pdfTopics").textContent = document.getElementById("topics").value;
  document.getElementById("pdfTrainingType").textContent = document.getElementById("trainingType")?.value || "";
  document.getElementById("pdfAchievements").textContent = document.getElementById("achievements").value;
  document.getElementById("pdfOpportunities").textContent = document.getElementById("opportunities").value;
  document.getElementById("pdfFollowUps").textContent = document.getElementById("followUps").value;
  document.getElementById("pdfClosing").textContent = document.getElementById("closing").value;

  const letterElement = document.getElementById("pdfLetter");
  letterElement.style.visibility = "visible";
  letterElement.style.position = "static";
  letterElement.style.opacity = "1";

  const opt = {
    margin: 0.5,
    filename: "FTS_Recap.pdf",
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  setTimeout(() => {
    html2pdf().set(opt).from(letterElement).save().finally(() => {
      letterElement.style.visibility = "hidden";
      letterElement.style.position = "absolute";
      letterElement.style.opacity = "0";
    });
  }, 200);
}

function generateWord() {
  const content = Uint8Array.from(atob(TEMPLATE_BASE64), c => c.charCodeAt(0));
  let zip;
  try {
    zip = new PizZip(content);
  } catch (zipError) {
    console.error("PizZip load error:", zipError);
    alert("Could not load the Word template. Check if the file is corrupted.");
    return;
  }

  let doc;
  try {
    doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  } catch (docInitError) {
    console.error("Docxtemplater init error:", docInitError);
    alert("Failed to initialize Word processor.");
    return;
  }

  doc.setData({
    accountName: document.getElementById("accountName").value,
    attention: document.getElementById("attention").value,
    cc: document.getElementById("cc").value,
    audienceName: document.getElementById("audienceName").value,
    opening: document.getElementById("opening").value,
    locations: document.getElementById("locations").value,
    topics: document.getElementById("topics")?.value || "",
    trainingType: document.getElementById("trainingType")?.value || "",
    achievements: document.getElementById("achievements").value,
    opportunities: document.getElementById("opportunities").value,
    followUps: document.getElementById("followUps").value,
    closing: document.getElementById("closing").value,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    }),
    ftsName: "Neal McGlinchey"
  });

  try {
    doc.render();
  } catch (error) {
    const e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties
    };
    console.error("Docxtemplater render error:", JSON.stringify(e, null, 2));
    alert("Word generation failed. Check browser console for details.");
    return;
  }

  const out = doc.getZip().generate({ type: "blob" });
  saveAs(out, "FTS_Recap.docx");
}

function sendEmail() {
  const to = encodeURIComponent(document.getElementById("attention")?.value || "");
  const cc = encodeURIComponent(document.getElementById("cc")?.value || "");
  const name = document.getElementById("audienceName")?.value || "";
  const topics = document.getElementById("topics")?.value?.split("\n").map(t => "• " + t).join("\n") || "";
  const achievements = document.getElementById("achievements")?.value?.split("\n").map(a => "• " + a).join("\n") || "";

  const subject = `Valvoline FTS Recap for ${document.getElementById("accountName")?.value || "Account"}`;
  let body = `Hello ${name},\n\nThanks for your time this week. Below are a few high-level notes from my visits. My detailed notes are in the Word recap.\n\n`;

  if (topics) body += "Topics Covered:\n" + topics + "\n\n";
  if (achievements) body += "Key Achievements:\n" + achievements + "\n\n";

  body += "Thank you for your partnership with Valvoline. Please let me know if you have any questions.";

  const mailtoLink = `mailto:${to}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
}
