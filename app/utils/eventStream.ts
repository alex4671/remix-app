// @ts-ignore
export const eventStream = (request: Request, init) => {
  if (!request.signal) return new Response(null, {status: 500})
  let stream = new ReadableStream({
    start(controller) {
      let encoder = new TextEncoder();

      let send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`))
        controller.enqueue(encoder.encode(`data: ${event}\n\n`))
      }

      let cleanup = init(send)

      let closed = false;
      let close = () => {
        if (closed) return;
        cleanup()
        closed = true;

        request.signal.removeEventListener("abort", close);
        controller.close();
      };

      request.signal.addEventListener("abort", close);
      if (request.signal.aborted) {
        close();
        return;
      }
    },
  })

  return new Response(stream, {
    headers: {'Content-Type': 'text/event-stream'}
  })
}
