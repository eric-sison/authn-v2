import { OIDCConfigService } from "@/lib/oidc/services/oidc-config-service";
import { Hono } from "hono";

// this route is for testing only
export const discoveryHandler = new Hono().get("/.well-known/openid-configuration", (c) => {
  const oidcProvider = new OIDCConfigService({
    issuer: "https://auth.example.com",
    authorizationEndpoint: "https://auth.example.com/authorize",
    tokenEndpoint: "https://auth.example.com/token",
    userinfoEndpoint: "https://auth.example.com/userinfo",
    jwksUri: "https://auth.example.com/.well-known/jwks.json",
    responseTypesSupported: ["code id_token", "code"],
    subjectTypesSupported: ["public"],
    idTokenSigningAlgValuesSupported: ["RS256"],
    scopesSupported: ["openid", "profile", "email"],
  });

  return c.json({ ...oidcProvider.getDiscoveryDocument() });
});
