import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsMatchingPassword(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMatchingPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedValue = (args.object as any)[args.constraints[0]];
          return value === relatedValue; // Check if the value matches the related value
        },
        defaultMessage(args: ValidationArguments) {
          return `${propertyName} must match with ${args.constraints[0]}`; // Default error message
        },
      },
    });
  };
}
