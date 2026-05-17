const Joi = require('joi');

/**
 * Middleware factory: validates req.body against a Joi schema.
 * Returns 400 with a clear error message if validation fails.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ error: messages });
    }
    next();
  };
}

// ── Schemas ──────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().allow(null, '').optional(),
  password: Joi.string().min(6).max(128).allow(null, '').optional(),
  role: Joi.string().valid('farmer', 'factory', 'regulator').required(),
  phone: Joi.string().trim().max(30).allow(null, '').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

const rateSchema = Joi.object({
  quality: Joi.string().valid('A+', 'A', 'B').required(),
  factory_rating: Joi.number().integer().min(1).max(5).required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  rateSchema,
};
