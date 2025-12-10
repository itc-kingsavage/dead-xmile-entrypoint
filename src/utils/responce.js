// src/utils/response.js

export default {
    success: (res, message = "Success", data = {}) => {
        return res.status(200).json({
            status: true,
            message,
            data
        });
    },

    error: (res, message = "Something went wrong", code = 500) => {
        return res.status(code).json({
            status: false,
            message
        });
    },

    missing: (res, field) => {
        return res.status(400).json({
            status: false,
            message: `Missing required field: ${field}`
        });
    }
};
