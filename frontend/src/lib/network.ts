import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
  type IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const defaultDevelopmentApiBaseUrl = "http://localhost:5016/api";

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

type CreateHubConnectionOptions = {
  hubPath: string;
  accessTokenFactory?: () => string;
};

export function createHubConnection({
  hubPath,
  accessTokenFactory,
}: CreateHubConnectionOptions): HubConnection {
  const connectionOptions: IHttpConnectionOptions = {
    // Shared hosts often block or downgrade WebSockets, so keep fallbacks enabled.
    transport:
      HttpTransportType.WebSockets |
      HttpTransportType.ServerSentEvents |
      HttpTransportType.LongPolling,
  };

  if (accessTokenFactory) {
    connectionOptions.accessTokenFactory = accessTokenFactory;
  }

  return new HubConnectionBuilder()
    .withUrl(getHubUrl(hubPath), connectionOptions)
    .configureLogging(
      process.env.NODE_ENV === "development"
        ? LogLevel.Information
        : LogLevel.Warning
    )
    .withAutomaticReconnect()
    .build();
}
