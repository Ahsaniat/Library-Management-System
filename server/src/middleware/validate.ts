import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain, matchedData } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Runs the validation chains and replaces `req.body` with the allowlisted set
 * of validated fields. Unknown fields are dropped so a request can never mass
 * assign attributes that were not explicitly declared.
 */
export function validate(validations: ValidationChain[]): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => {
        if ('path' in err) {
          return `${err.path}: ${err.msg}`;
        }
        return err.msg;
      });

      throw new ValidationError(errorMessages.join(', '));
    }

    req.body = matchedData(req, {
      locations: ['body'],
      includeOptionals: true,
    });

    return next();
  };
}
