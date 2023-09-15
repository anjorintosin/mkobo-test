/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as yup from 'yup'

/**
 * Validates the request body against a schema.
 * @param {any} req - The Express request object.
 * @returns {Promise<void>} - A promise that resolves when validation is complete.
 */
export const validateRequest = async (req: any) => {
  const schema = yup.object().shape({
    from: yup.string().min(6).max(16).required(),
    to: yup.string().min(6).max(16).required(),
    text: yup.string().min(1).max(120).required()
  })

  await schema.validate(req.body)
}
