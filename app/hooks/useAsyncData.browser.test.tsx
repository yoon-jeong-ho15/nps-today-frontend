import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useAsyncData } from "./useAsyncData";

type Load = (signal: AbortSignal) => Promise<string>;
function deferred() {
  let resolve!: (value: string) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("async data lifecycle", () => {
  let container: HTMLDivElement;
  let root: Root;
  let latest: ReturnType<typeof useAsyncData<string>>;
  function Probe({ load }: { load: Load }) {
    latest = useAsyncData(load, "");
    return <span>{latest.data}</span>;
  }
  const render = async (load: Load) => {
    await act(async () => root.render(<Probe load={load} />));
  };

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("keeps the newest response when an older request finishes later", async () => {
    const oldRequest = deferred();
    const newRequest = deferred();
    let oldSignal!: AbortSignal;
    await render((signal) => {
      oldSignal = signal;
      return oldRequest.promise;
    });
    await render(() => newRequest.promise);
    expect(oldSignal.aborted).toBe(true);
    await act(async () => newRequest.resolve("new"));
    await act(async () => oldRequest.resolve("old"));
    expect(latest.data).toBe("new");
    expect(latest.loading).toBe(false);
  });

  it("clears an earlier error and allows a new request to succeed", async () => {
    const failed = deferred();
    await render(() => failed.promise);
    await act(async () => failed.reject(new Error("offline")));
    expect(latest.error).toBe("offline");
    const retry = deferred();
    await render(() => retry.promise);
    expect(latest.error).toBeNull();
    expect(latest.loading).toBe(true);
    await act(async () => retry.resolve("recovered"));
    expect(latest.data).toBe("recovered");
    expect(latest.error).toBeNull();
  });

  it("ignores an older failure while the current request is still loading", async () => {
    const oldRequest = deferred();
    const current = deferred();
    await render(() => oldRequest.promise);
    await render(() => current.promise);
    await act(async () => oldRequest.reject(new Error("old failure")));
    expect(latest.loading).toBe(true);
    expect(latest.error).toBeNull();
    await act(async () => current.resolve("current"));
  });

  it("preserves loaded data while refreshing and aborts on unmount", async () => {
    await render(async () => "loaded");
    const pending = deferred();
    let signal!: AbortSignal;
    await render((nextSignal) => {
      signal = nextSignal;
      return pending.promise;
    });
    expect(latest.data).toBe("loaded");
    expect(latest.initialLoading).toBe(false);
    expect(latest.dataLoading).toBe(true);
    await act(async () => root.render(null));
    expect(signal.aborted).toBe(true);
    await act(async () => pending.resolve("ignored"));
    expect(container.textContent).toBe("");
  });
});
