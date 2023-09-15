import * as yup from 'yup';

export const validateRequest = async (req: any) => {
    const schema = yup.object().shape({
      from: yup.string().min(6).max(16).required(),
      to: yup.string().min(6).max(16).required(),
      text: yup.string().min(1).max(120).required(),
    });
  
    await schema.validate(req.body);
  };