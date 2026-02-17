import { act, type ReactElement } from "react";
import reactDom from "react-dom/server";
import { PassThrough } from "stream";

type RenderOptions = {
  stripReactSSRComments?: boolean;
};

/**
 * Render a React element to a string using streaming SSR.
 * @param element React element to render
 * @param options If stripReactSSRComments is true, removes <!-- --> or <!--$--> inserted by React streaming SSR
 */
export async function renderToStringFromStream(
  element: ReactElement,
  options: RenderOptions = {},
) {
  const { stripReactSSRComments } = options;

  return new Promise<string>((resolve, reject) => {
    const stream = new PassThrough();
    let html = "";

    stream.on("data", (chunk) => (html += chunk));
    stream.on("end", () => {
      if (stripReactSSRComments) {
        // Remove internal markers <!-- --> and streaming root markers <!--$--> / <!--/$-->
        html = html
          .replace(/<!--\$-->/g, "")
          .replace(/<!--\/\$-->/g, "")
          .replace(/<!--\s*-->/g, "");
      }
      resolve(html);
    });
    stream.on("error", reject);

    act(() => {
      const { pipe } = reactDom.renderToPipeableStream(element, {
        onAllReady() {
          pipe(stream);
        },
        onError(error) {
          reject(error);
        },
      });
    });
  });
}
