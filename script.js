function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Set the current date in the header
document.addEventListener("DOMContentLoaded", function () {
  let today = new Date();
  let formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  document.getElementById("currentDate").innerText = formattedDate;
});

// Show instruction modal and disable inputs on page load
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("instructionModal").style.display = "flex";
  document.querySelectorAll('.container input, .container textarea, #pdfButton, #emailButton').forEach(el => {
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

    // Enable PDF and Email buttons after adjustments
    document.getElementById('pdfButton').disabled = false;
    document.getElementById('emailButton').disabled = false;
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

    // Set initial placeholder text
    applyPlaceholderStyle(attentionField, selectedDefaults.attention);
    applyPlaceholderStyle(ccField, selectedDefaults.cc);

    // Remove placeholder on focus; restore on blur if empty
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
}

document.querySelectorAll('.container input, .container textarea').forEach(el => {
  el.addEventListener("input", validateForm);
});

// New generatePDF function using html2pdf.js
function generatePDF() {
  console.log("generatePDF triggered");
  let element = document.querySelector('.container');
  if (!element) {
    console.error("Container element not found");
    alert("Error: Container element not found.");
    return;
  }
  
  let today = new Date();
  let formattedDate = today.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
  let defaultFileName = `1 Recap for ${formattedDate}.pdf`;
  
  // Ask user for the file name; if they cancel the first prompt, ask again.
  let fileName = prompt(`Do you want to use the default naming convention for the PDF file?\nClick OK to use:\n"${defaultFileName}"\nOr click Cancel to enter a custom name.`)
    ? defaultFileName
    : prompt("Enter PDF file name:", defaultFileName) || defaultFileName;

  let opt = {
    margin: 0.5,
    filename: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  console.log("Options set for html2pdf:", opt);

  html2pdf().set(opt).from(element).save()
    .then(() => {
      console.log("PDF generation complete.");
    })
    .catch((error) => {
      console.error("Error during PDF generation:", error);
      alert("There was an error generating the PDF. Check the console for details.");
    });
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
    "Thanks for your time this week, below are a few high‑level notes from my visits. My detailed notes can be found in the attached PDF.\n\n" +
    "The topics covered and our key achievements are below:\n\n";

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
