type CustomError = (a: { error?: Error; message?: string }) => Error;

export const customError: CustomError = ({ error, message }) => {
  const newError = new Error();

  if (error) {
    newError.stack = error.stack;
    newError.message = error.message;
    newError.name = error.name;
  }
  if (message) {
    newError.message = message;
  }

  return newError;
};
