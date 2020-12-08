export default class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ErrorWithCode extends CustomError {
  constructor(public code: number, message: string) {
    super(message);
  }
}
