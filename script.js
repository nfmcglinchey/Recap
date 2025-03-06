function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Set the current date in the header when DOM loads
document.addEventListener("DOMContentLoaded", function () {
  let today = new Date();
  let formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  document.getElementById("currentDate").innerText = formattedDate;
});

// Show instruction modal and disable inputs on page load
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("instructionModal").style.display = "flex";
  document.querySelectorAll('.container input, .container textarea, #pdfButton, #emailButton, #wordButton').forEach(el => {
    el.disabled = true;
  });
});

function closeModal(type) {
  document.getElementById("instructionModal").style.display = "none";
  document.getElementById("accountTypeModal").style.display = "flex";

  if (type === "non-scheduled") {
    let topicsInput = document.getElementById("topics");
    if (topicsInput) {
      let topicsLabel = topicsInput.previousElementSibling;
      if (topicsLabel) topicsLabel.remove();
      topicsInput.remove();
    }

    let trainingInput = document.getElementById("trainingType");
    if (trainingInput) {
      let trainingLabel = trainingInput.previousElementSibling;
      if (trainingLabel) trainingLabel.remove();
      trainingInput.remove();
    }

    let achievementsInput = document.getElementById("achievements");
    if (achievementsInput) {
      achievementsInput.value = achievementsInput.value.replace(
        "The training resulted in the following key achievements:",
        "The topics covered on the FTS visit were:"
      );
    }

    // Enable PDF, Email, and Word buttons after adjustments
    document.getElementById('pdfButton').disabled = false;
    document.getElementById('emailButton').disabled = false;
    document.getElementById('wordButton').disabled = false;
  }
}

function confirmAccountType() {
  let selectedType = document.querySelector('input[name="accountType"]:checked');
  if (!selectedType) {
    alert("Please select an account type.");
    return;
  }

  document.getElementById("accountTypeModal").style.display = "none";

  // Enable form fields after account type selection
  document.querySelectorAll('.container input, .container textarea').forEach(el => el.disabled = false);
  validateForm();

  // Set default placeholder text based on account type
  let defaults = {
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

  let selectedDefaults = defaults[selectedType.value];
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
  let inputs = document.querySelectorAll('.container input, .container textarea');
  let allFilled = Array.from(inputs).every(input => input.value.trim() !== "");
  document.getElementById('pdfButton').disabled = !allFilled;
  document.getElementById('emailButton').disabled = !allFilled;
  document.getElementById('wordButton').disabled = !allFilled;
}

document.querySelectorAll('.container input, .container textarea').forEach(el => {
  el.addEventListener("input", validateForm);
});

function generatePDF() {
  // Populate the hidden PDF letter container with form data
  let date = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
  document.getElementById("pdfDate").textContent = date;
  document.getElementById("pdfAccountName").textContent = document.getElementById("accountName").value;
  document.getElementById("pdfAttention").textContent = document.getElementById("attention").value;
  document.getElementById("pdfCC").textContent = document.getElementById("cc").value;
  document.getElementById("pdfAudienceName").textContent = document.getElementById("audienceName").value;
  document.getElementById("pdfOpening").textContent = document.getElementById("opening").value;
  document.getElementById("pdfLocations").textContent = document.getElementById("locations").value;
  document.getElementById("pdfTopics").textContent = document.getElementById("topics").value;
  document.getElementById("pdfTrainingType").textContent = document.getElementById("trainingType").value;
  document.getElementById("pdfAchievements").textContent = document.getElementById("achievements").value;
  document.getElementById("pdfOpportunities").textContent = document.getElementById("opportunities").value;
  document.getElementById("pdfFollowUps").textContent = document.getElementById("followUps").value;
  document.getElementById("pdfClosing").textContent = document.getElementById("closing").value;

  let letterElement = document.getElementById("pdfLetter");
  if (!letterElement) {
    console.error("pdfLetter container not found");
    alert("Error: pdfLetter container not found.");
    return;
  }

  let defaultFileName = `1 Recap for ${date}.pdf`;
  let fileName = prompt(`Do you want to use the default naming convention for the PDF file?
Click OK to use:
"${defaultFileName}"
Or click Cancel to enter a custom name.`)
    ? defaultFileName
    : prompt("Enter PDF file name:", defaultFileName) || defaultFileName;

  let opt = {
    margin: 0.5,
    filename: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  setTimeout(() => {
    html2pdf().set(opt).from(letterElement).save()
      .then(() => {
        console.log("PDF generation complete.");
      })
      .catch((error) => {
        console.error("Error during PDF generation:", error);
        alert("There was an error generating the PDF. Check the console for details.");
      });
  }, 100);
}

function sendEmail() {
  let audienceEmail = document.getElementById("attention")?.value || "";
  let ccEmails = document.getElementById("cc")?.value || "";
  let audienceName = document.getElementById("audienceName")?.value || "";

  let topicsInput = document.getElementById("topics");
  let topics = topicsInput ? topicsInput.value.split("\n").map(topic => "• " + topic).join("\n") : "";

  let achievementsInput = document.getElementById("achievements");
  let achievements = achievementsInput ? achievementsInput.value.split("\n").map(achievement => "• " + achievement).join("\n") : "";

  let subject = `Valvoline FTS Recap for ${document.getElementById("accountName")?.value || "Account"}`;

  let body = `Hello ${audienceName},\n\n` +
    `Thanks for your time this week, below are a few high‑level notes from my visits. My detailed notes can be found in the attached PDF.\n\n` +
    `The topics covered and our key achievements are below:\n\n`;

  if (topics) {
    body += topics + "\n";
  }

  if (achievements) {
    body += achievements + "\n\n";
  }

  body += "Thank you for your partnership with Valvoline, please let me know if you have any other questions.";

  let mailtoLink = `mailto:${encodeURIComponent(audienceEmail)}?cc=${encodeURIComponent(ccEmails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
}

function generateWord() {
  // Use the correct path to your .dotx file here:
  fetch("./Recap Template - Master 2025.dotx") 
    .then(response => response.arrayBuffer())
    .then(content => {
      let zip = new PizZip(content);
      let doc = new window.docxtemplater(zip);
      doc.setData({
        accountName: document.getElementById("accountName").value,
        attention: document.getElementById("attention").value,
        cc: document.getElementById("cc").value,
        audienceName: document.getElementById("audienceName").value,
        opening: document.getElementById("opening").value,
        locations: document.getElementById("locations").value,
        topics: document.getElementById("topics").value,
        trainingType: document.getElementById("trainingType").value,
        achievements: document.getElementById("achievements").value,
        opportunities: document.getElementById("opportunities").value,
        followUps: document.getElementById("followUps").value,
        closing: document.getElementById("closing").value
      });

      try {
        doc.render();
      } catch (error) {
        console.error("Error during template rendering:", error);
        alert("Error generating Word document. Check the console for details.");
        return;
      }

      let out = doc.getZip().generate({ type: "blob" });
      saveAs(out, "Recap.docx");
    });
}

document.getElementById('darkModeToggle').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
});
