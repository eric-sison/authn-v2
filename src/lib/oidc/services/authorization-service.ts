import { I_AuthorizationService } from "../interfaces/authorization";
import { AuthorizationRequest, AuthorizationResponse } from "../types/oidc";
import { OIDCCodeChallengeMethods, OIDCResponseTypes, OIDCScopes } from "../types/oidc";
import { OIDCConfigService } from "./oidc-config-service";

export class AuthorizationService implements I_AuthorizationService {
  constructor(private readonly oidcConfigService: OIDCConfigService) {}

  async processAuthorizationRequest(request: AuthorizationRequest): Promise<AuthorizationResponse> {
    this.validateAuthorizationRequest(request);
    throw new Error("Method not implemented.");
  }

  public validateAuthorizationRequest(request: AuthorizationRequest) {
    if (!request.clientId.trim()) {
      throw new Error("client_id is required");
    }

    if (!request.redirectUri?.trim()) {
      throw new Error("redirect_uri is required");
    }

    if (!this.oidcConfigService.isValidUrl(request.redirectUri)) {
      throw new Error("redirect_uri must be a valid URL");
    }

    if (!request.scope.trim()) {
      throw new Error("scope is required");
    }

    this.validateResponseType(request.responseType);

    this.validateScopes(request.scope);

    this.validatePKCE(request.codeChallenge, request.codeChallengeMethod);
  }

  private validateResponseType(responseType: OIDCResponseTypes) {
    const supportedResponseTypes = this.oidcConfigService.getResponseTypesSupported();

    if (!supportedResponseTypes.includes(responseType)) {
      throw new Error(`Unsupported response_type: ${responseType}`);
    }
  }

  private validateScopes(scopeString: string) {
    const requestedScopes = scopeString.split(" ").filter((s) => s.trim());

    if (requestedScopes.length === 0) {
      throw new Error("At least one scope is required!");
    }

    // OIDC requires 'openid' scope
    if (!requestedScopes.includes("openid")) {
      throw new Error("scope must include 'openid' for OIDC!");
    }

    // Check if all scopes are supported
    const supportedScopes = this.oidcConfigService.getScopesSupported();

    const unsupportedScopes = requestedScopes.filter(
      (scope) => !supportedScopes.includes(scope as OIDCScopes),
    );

    if (unsupportedScopes.length > 0) {
      throw new Error(`Unsupported scopes: ${unsupportedScopes.join(", ")}`);
    }
  }

  private validatePKCE(
    codeChallenge: string | undefined,
    codeChallengeMethod: OIDCCodeChallengeMethods | undefined,
  ) {
    const hasCodeChallenge = !!codeChallenge;
    const hasCodeChallengeMethod = !!codeChallengeMethod;

    // Both or neither should be present
    if (hasCodeChallenge !== hasCodeChallengeMethod) {
      throw new Error("code_challenge and code_challenge_method must be used together");
    }

    if (hasCodeChallengeMethod) {
      const supportedMethods = this.oidcConfigService.getCodeChallengeMethodsSupported();

      if (!supportedMethods?.includes(codeChallengeMethod!)) {
        throw new Error(`Unsupported code_challenge_method: ${codeChallengeMethod}`);
      }
    }
  }
}
