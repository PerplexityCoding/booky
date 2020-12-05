import { storageGet } from "@/services/chrome/storage";

const queue = [];
let Vue = null;

// Store reference to the old `onerror` handler and override it with our own function
// that will just push exceptions to the queue and call through old handler if we found one

const _oldOnerror = window["onerror"];
window["onerror"] = function () {
  // Use keys as "data type" to save some characters"
  queue.push({
    e: [].slice.call(arguments),
  });

  if (_oldOnerror) _oldOnerror.apply(window, arguments);
};

// Do the same store/queue/call operations for `onunhandledrejection` event
const _oldOnunhandledrejection = window["onunhandledrejection"];
window["onunhandledrejection"] = function (exception) {
  queue.push({
    p: exception.reason,
  });
  if (_oldOnunhandledrejection)
    _oldOnunhandledrejection.apply(window, arguments);
};

export async function loadSentry() {
  const isAllowed = await isTrackingAllowed();
  if (isAllowed) {
    if (document.readyState === "complete") {
      asyncLoadSentry();
    } else {
      window.addEventListener("load", () => {
        asyncLoadSentry();
      });
    }
  }
}

function asyncLoadSentry() {
  setTimeout(async () => {
    try {
      const { logVueError, Sentry, initSentry } = await import(
        /* webpackChunkName: "sentry" */ "./sentry"
      );
      initSentry();

      Sentry.onLoad(() => {
        drainQueue(Sentry, logVueError);
        if (Vue) {
          addVueGlobalErrorHandler(logVueError);
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, 100);
}

async function isTrackingAllowed() {
  return true;
}

function drainQueue(Sentry, logVueError) {
  try {
    // And now capture all previously caught exceptions
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].e) {
        Sentry.captureException(queue[i].e);
      } else if (queue[i].v) {
        logVueError(queue[i].v);
      } else if (queue[i].p) {
        Sentry.captureException(queue[i].p);
      }
    }

    queue.splice(0, queue.length);
  } catch (o_O) {
    // eslint-disable-next-line no-console
    console.error(o_O);
  }
}

export function queueVueGlobalErrorHandler(_Vue) {
  Vue = _Vue;
  Vue.config.errorHandler = function (err, vm, info) {
    queue.push({
      v: {
        err,
        vm,
        info,
      },
    });
    // eslint-disable-next-line no-console
    console.error(err);
  };
}

function addVueGlobalErrorHandler(logVueError) {
  Vue.config.errorHandler = function (err, vm, info) {
    setTimeout(() => {
      logVueError({
        err,
        vm,
        info,
      });
    });
    // eslint-disable-next-line no-console
    console.error(err);
  };
}
