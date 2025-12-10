// src/qr/display.js

import logger from "../utils/logger.js";

export default function displayQR(qrImage, res) {
    try {
        if (!qrImage) {
            logger.error("No QR image received for display.");
            return res.status(500).json({
                status: false,
                message: "Failed to generate QR code."
            });
        }

        logger.success("Sending QR code to client...");

        return res.status(200).json({
            status: true,
            message: "QR Code generated successfully.",
            qr: qrImage // Base64 Data URL
        });

    } catch (err) {
        logger.error("Error displaying QR: " + err.message);
        return res.status(500).json({
            status: false,
            message: "Internal display error."
        });
    }
}
