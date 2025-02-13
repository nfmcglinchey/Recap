// script.js

function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

document.addEventListener("DOMContentLoaded", function () {
    if (isMobile()) {
        alert("For the best experience, open this page in Safari or Chrome.");
    }
});

// Set current date in the header
document.addEventListener("DOMContentLoaded", function () {
    let today = new Date();
    let formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
    document.getElementById("currentDate").innerText = formattedDate;
});

// Show instruction modal on page load and disable form inputs initially
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

        // Enable PDF and Email buttons after removing fields
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

    // Define default placeholder text values based on account type
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

function generatePDF() {
    // Get the embedded base64 DOCX template (if available)
    const base64Template = document.getElementById('base64DocxTemplate')?.textContent.trim();
    
    // File naming setup
    let today = new Date();
    let formattedDate = today.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
    });
    let defaultFileName = `1 Recap for ${formattedDate}.pdf`;
    let useDefault = confirm(`Do you want to use the default naming convention for the PDF file?\n\nClick OK to use:\n"${defaultFileName}"\n\nOr click Cancel to enter a custom name.`);
    let fileName = defaultFileName;
    if (!useDefault) {
        let customName = prompt("Enter PDF file name:", defaultFileName);
        if (customName) {
            fileName = customName.endsWith(".pdf") ? customName : `${customName}.pdf`;
        }
    }

    // Option 2: If a base64 DOCX template is provided, convert it to HTML then to PDF.
    if (base64Template) {
        // Convert the base64 string to an ArrayBuffer.
        let binaryString = window.atob(base64Template);
        let len = binaryString.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Use Mammoth to convert the DOCX (from the ArrayBuffer) to HTML.
        mammoth.convertToHtml({ arrayBuffer: bytes.buffer })
            .then(function(result) {
                let htmlContent = result.value;
                // Create a temporary container for the HTML.
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                
                // Generate the PDF using jsPDF's html() method.
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                doc.html(tempDiv, {
                    callback: function(doc) {
                        doc.save(fileName);
                    },
                    x: 10,
                    y: 10,
                });
            })
            .catch(function(error) {
                console.error("Error converting DOCX to HTML:", error);
                alert("There was an error processing the DOCX template. Check the console for details.");
            });
    } else {
        // Fallback: Build a PDF using the form values directly.
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        let xOffset = 10;
        let yOffset = 20;

        // Valvoline Branding Header
        doc.setFont("helvetica", "bold");
        doc.text("Neal McGlinchey", xOffset, yOffset);
        doc.setFont("helvetica", "normal");
        doc.text("Manager of Field Training", xOffset, yOffset + 5);
        doc.text("Mobile: (1) 878-278-5100", xOffset, yOffset + 10);
        doc.text("NMcGlinchey@valvolineglobal.com", xOffset, yOffset + 15);

        // Blue Divider Line
        doc.setDrawColor(0, 0, 255);
        doc.line(xOffset, yOffset + 20, 200, yOffset + 20);

        // Add Date
        doc.setFont("helvetica", "bold");
        doc.text(`Date: ${formattedDate}`, 170, yOffset + 25);
        yOffset += 35;

        function addSection(title, content) {
            if (content && content.trim() !== "") {
                doc.setFont("helvetica", "bold");
                doc.text(`${title}:`, xOffset, yOffset);
                doc.setFont("helvetica", "normal");

                let lines = doc.splitTextToSize(content, 180);
                lines.forEach(line => {
                    yOffset += 7;
                    doc.text(line, xOffset + 30, yOffset);
                });
                yOffset += 10;
            }
        }

        addSection("Account", document.getElementById("accountName")?.value || "");
        addSection("Attention", document.getElementById("attention")?.value || "");
        addSection("CC", document.getElementById("cc")?.value || "");

        let audience = document.getElementById("audienceName")?.value || "";
        if (audience.trim() !== "") {
            doc.text(`Dear ${audience},`, xOffset, yOffset);
            yOffset += 10;
        }

        function addTextBlock(content) {
            if (content && content.trim() !== "") {
                let lines = doc.splitTextToSize(content, 180);
                lines.forEach(line => {
                    yOffset += 7;
                    doc.text(line, xOffset, yOffset);
                });
                yOffset += 10;
            }
        }

        addTextBlock(document.getElementById("opening")?.value || "");
        let topicsInput = document.getElementById("topics");
        if (topicsInput) {
            addSection("Topics Covered", topicsInput.value);
        }
        addSection("Training Type & Headcount", document.getElementById("trainingType")?.value || "");
        addSection("Key Achievements", document.getElementById("achievements")?.value || "");
        addSection("Opportunities for Improvement", document.getElementById("opportunities")?.value || "");
        addSection("Follow-Ups", document.getElementById("followUps")?.value || "");
        addTextBlock(document.getElementById("closing")?.value || "");

        // Closing Signature
        doc.text("Sincerely,", xOffset, yOffset);
        yOffset += 10;
        doc.text("Neal McGlinchey", xOffset, yOffset);

        // Red Divider Line
        doc.setDrawColor(255, 0, 0);
        doc.line(xOffset, yOffset + 10, 200, yOffset + 10);

        // Footer with Contact Info
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("Valvoline Global Operations | 100 Valvoline Way, Suite 200 | Lexington, KY 40509 | valvolineglobal.com", xOffset, yOffset + 20);

        doc.save(fileName);
    }
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
