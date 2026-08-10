FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY backend/CollabOS.Api/CollabOS.Api.csproj backend/CollabOS.Api/
RUN dotnet restore backend/CollabOS.Api/CollabOS.Api.csproj

COPY backend/CollabOS.Api/ backend/CollabOS.Api/
WORKDIR /src/backend/CollabOS.Api
RUN dotnet publish CollabOS.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "CollabOS.Api.dll"]
