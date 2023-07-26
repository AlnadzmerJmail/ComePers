const BaseJoi = require('joi');

// prevent from inputing html tags
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
	type: 'string',
	base: joi.string(),
	messages: {
		'string.escapeHTML': '{{#label}} must not include HTML!',
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = sanitizeHtml(value, {
					allowedTags: [],
					allowedAttributes: {},
				});

				if (clean !== value)
					return helpers.error('string.escapeHTML', { value });

				return clean;
			},
		},
	},
});

const Joi = BaseJoi.extend(extension);

const campgroundJoiSchema = Joi.object({
	campground: Joi.object({
		title: Joi.string().required().escapeHTML(),
		price: Joi.number().required().min(0),
		images: Joi.object({
			url: Joi.string().required(),
			filename: Joi.string().required(),
		}),
		location: Joi.string().required().escapeHTML(),
		description: Joi.string().required().escapeHTML(),
	}),
	deleteImages: Joi.array(),
});

const reviewJoiSchema = Joi.object({
	review: Joi.object({
		body: Joi.string().required().escapeHTML(),
		rating: Joi.number(),
	}),
});

module.exports = { campgroundJoiSchema, reviewJoiSchema };
