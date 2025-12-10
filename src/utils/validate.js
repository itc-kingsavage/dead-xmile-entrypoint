// src/utils/validate.js

/**
 * Simple validation utilities for sanitizing user input,
 * checking required fields, and ensuring proper formats.
 */

function isEmpty(value) {
    return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim().length === 0)
    );
}

function validateRequired(fields, data) {
    const errors = [];

    fields.forEach((field) => {
        if (isEmpty(data[field])) {
            errors.push(`${field} is required`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}

function validatePhone(phone) {
    // Basic phone check (allows numbers, +, spaces)
    const regex = /^[0-9+ ]{6,15}$/;
    return regex.test(phone);
}

function validateEmail(email) {
    // Simple email format check
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateId(id) {
    // Ensure ID is a valid Mongo ObjectId format
    const regex = /^[0-9a-fA-F]{24}$/;
    return regex.test(id);
}

module.exports = {
    isEmpty,
    validateRequired,
    validatePhone,
    validateEmail,
    validateId,
};
