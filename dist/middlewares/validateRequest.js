"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (ZodSchema, part = 'body') => async (req, res, next) => {
    try {
        let dataToValidate;
        if (part === 'body') {
            let requestBody = req.body;
            if (requestBody?.data) {
                requestBody = JSON.parse(requestBody.data);
            }
            dataToValidate = requestBody || {};
        }
        else if (part === 'query') {
            dataToValidate = req.query || {};
        }
        else {
            dataToValidate = req.params || {};
        }
        const validatedData = await ZodSchema.parseAsync(dataToValidate);
        if (part === 'body') {
            req.body = validatedData;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateRequest = validateRequest;
