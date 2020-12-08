import { ErrorWithCode } from "./error";

type Predicate<T> = (T) => boolean;

export class HTTPError extends ErrorWithCode {
  constructor(code = 400, message = "HTTP Error") {
    super(code, message);
  }
}

export class ResourceNotFoundException extends HTTPError {
  constructor(code = 404, message = "Resource not found") {
    super(code, message);
  }
}

export default class Network {
  static async loadJSON(filePath): Promise<any> {
    const xhr = await Network.fetch(filePath, (xhr) => {
      xhr.overrideMimeType("application/json");
      xhr.responseType = "json";
    });
    return xhr.response;
  }

  static async fetch(
    url,
    prerequest: (xhr: XMLHttpRequest) => void = () => {},
    method = "GET",
    body = null,
    resolveCondition: Predicate<number> = (status) =>
      status >= 200 && status < 300
  ): Promise<XMLHttpRequest> {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    prerequest(xhr);
    xhr.send(body);

    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (resolveCondition(xhr.status)) resolve(xhr);
          else
            reject(new ResourceNotFoundException(xhr.status, xhr.statusText));
        }
      };
    });
  }
}
