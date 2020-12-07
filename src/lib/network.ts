type Predicate<T> = (T) => boolean;

export class HTTPError extends Error {
  constructor(public code: number = 400, message = "HTTP Error") {
    super(message);
  }
}

export default class Network {
  static async loadJSON(filePath): Promise<string> {
    const xhr = await Network.fetch(filePath, (xhr) =>
      xhr.overrideMimeType("application/json")
    );
    return xhr.response;
  }

  static async fetch(
    url,
    prerequest?: (xhr: XMLHttpRequest) => void,
    method = "GET",
    body = null,
    resolveCondition: Predicate<number> = (status) =>
      status >= 200 && status < 300
  ): Promise<XMLHttpRequest> {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.send(body);

    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (resolveCondition(xhr.status)) resolve(xhr);
          else throw new HTTPError(xhr.status, xhr.statusText);
        }
      };
    });
  }
}
