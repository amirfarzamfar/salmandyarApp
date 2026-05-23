import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  type IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const defaultDevelopmentApiBaseUrl = "http://localhost:5016/api";
const realtimeEnabled = process.env.NEXT_PUBLIC_ENABLE_REALTIME !== "false";
const signalRTransportMode = (
  process.env.NEXT_PUBLIC_SIGNALR_TRANSPORT?.trim().toLowerCase() ?? ""
);
const realtimeDebugEnabled = process.env.NEXT_PUBLIC_REALTIME_DEBUG === "true";

const apiBaseUrl = configuredApiBaseUrl
  ? trimTrailingSlash(configuredApiBaseUrl)
  : process.env.NODE_ENV === "development"
    ? defaultDevelopmentApiBaseUrl
    : "/api";

const apiOrigin = apiBaseUrl.endsWith("/api")
  ? apiBaseUrl.slice(0, -4)
  : apiBaseUrl;

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function getApiOrigin() {
  return apiOrigin;
}

export function resolveApiUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiOrigin ? `${apiOrigin}${normalizedPath}` : normalizedPath;
}

export function getHubUrl(hubPath: string) {
  const normalizedHubPath = hubPath.startsWith("/") ? hubPath : `/${hubPath}`;
  return apiOrigin ? `${apiOrigin}${normalizedHubPath}` : normalizedHubPath;
}

export function isRealtimeEnabled() {
  return realtimeEnabled;
}

function getPreferredTransport() {
  if (signalRTransportMode === "longpolling") {
    return HttpTransportType.LongPolling;
  }

  if (signalRTransportMode === "sse") {
    return HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling;
  }

  // Shared Windows hosts commonly block or downgrade WebSockets.
  if (process.env.NODE_ENV === "production") {
    return HttpTransportType.LongPolling;
  }

  return (
    HttpTransportType.WebSockets |
    HttpTransportType.ServerSentEvents |
    HttpTransportType.LongPolling
  );
}

export function isIgnorableSignalRError(error: unknown) {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (!message) {
    return false;
  }

  return [
    "The connection was stopped during negotiation",
    "Failed to start the connection",
    "AbortError",
    "WebSocket closed with status code",
  ].some((part) => message.includes(part));
}

export function reportSignalRError(context: string, error: unknown) {
  if (!realtimeDebugEnabled || isIgnorableSignalRError(error)) {
    return;
  }

  console.warn(`${context}:`, error);
}

export async function stopHubConnectionSafely(
  connection: HubConnection,
  startPromise?: Promise<void> | null
) {
  try {
    if (startPromise) {
      await startPromise.catch(() => undefined);
    }

    if (connection.state !== HubConnectionState.Disconnected) {
      await connection.stop();
    }
  } catch {
    // The app is intentionally silent when realtime is unavailable.
  }
}

type CreateHubConnectionOptions = {
  hubPath: string;
  accessTokenFactory?: () => string;
};

export function createHubConnection({
  hubPath,
  accessTokenFactory,
}: CreateHubConnectionOptions): HubConnection {
  const connectionOptions: IHttpConnectionOptions = {
    transport: getPreferredTransport(),
  };

  if (accessTokenFactory) {
    connectionOptions.accessTokenFactory = accessTokenFactory;
  }

  return new HubConnectionBuilder()
    .withUrl(getHubUrl(hubPath), connectionOptions)
    .configureLogging(LogLevel.None)
    .withAutomaticReconnect()
    .build();
}
