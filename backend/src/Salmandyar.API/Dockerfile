# syntax=docker/dockerfile:1.7

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS restore
WORKDIR /src

COPY Salmandyar.sln ./
COPY src/Salmandyar.API/Salmandyar.API.csproj src/Salmandyar.API/
COPY src/Salmandyar.Application/Salmandyar.Application.csproj src/Salmandyar.Application/
COPY src/Salmandyar.Domain/Salmandyar.Domain.csproj src/Salmandyar.Domain/
COPY src/Salmandyar.Infrastructure/Salmandyar.Infrastructure.csproj src/Salmandyar.Infrastructure/

RUN dotnet restore "src/Salmandyar.API/Salmandyar.API.csproj"

FROM restore AS build
WORKDIR /src

COPY src ./src

RUN dotnet publish "src/Salmandyar.API/Salmandyar.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

RUN dotnet tool install --tool-path /tools dotnet-ef --version 8.* \
    && /tools/dotnet-ef migrations bundle \
        --project src/Salmandyar.Infrastructure/Salmandyar.Infrastructure.csproj \
        --startup-project src/Salmandyar.API/Salmandyar.API.csproj \
        --configuration Release \
        --output /app/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runner
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true

RUN apt-get update \
    && apt-get install -y --no-install-recommends wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish ./
COPY --from=build /app/efbundle ./efbundle

RUN mkdir -p /app/wwwroot/uploads \
    && chmod +x /app/efbundle

EXPOSE 8080

ENTRYPOINT ["dotnet", "Salmandyar.API.dll"]
