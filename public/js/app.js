const qrBox = document.getElementById("qrBox");
const pairingBox = document.getElementById("pairing");

qrBox.innerHTML = "<p>Requesting QR Code...</p>";

/**
 * Fetch QR + Pairing Code from backend
 */
async function loadQR() {
    try {
        const res = await fetch("/qr");
        const data = await res.json();

        if (!data.status) {
            qrBox.innerHTML = `<p style="color:#ff4444">Error: ${data.message}</p>`;
            return;
        }

        // Display QR Code
        qrBox.innerHTML = `
            <img src="${data.qr}" 
            style="width:250px;border:2px solid #00ffea;box-shadow:0 0 15px #00ffe0;">
        `;

        // Display Pairing Code
        if (data.code) {
            pairingBox.innerHTML = `
                <p>PAIRING CODE: 
                   <span style="color:#00ff9d;font-size:20px;">
                       ${data.code}
                   </span>
                </p>
            `;
        } else {
            pairingBox.innerHTML = `<p>No pairing code available.</p>`;
        }

    } catch (err) {
        qrBox.innerHTML = `<p style="color:#ff4444">Failed to fetch QR… Retrying</p>`;
        
        // Retry every 2 seconds
        setTimeout(loadQR, 2000);
    }
}

// Start fetching immediately
setTimeout(() => {
    document.querySelector(".loader").innerHTML = "Scanner Ready ✓";
    loadQR();
}, 1500);
