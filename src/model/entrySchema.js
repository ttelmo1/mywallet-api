import Joi from 'joi';

export const entrySchema = Joi.object({
    description: Joi.string().required(),
    value: Joi.string().required(),
    type: Joi.string().required().valid('income', 'expense')
});
