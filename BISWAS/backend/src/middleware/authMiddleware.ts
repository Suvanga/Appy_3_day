import { auth } from 'express-oauth2-jwt-bearer';

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
export const checkJwt = auth({
  audience: 'https://api.biswas-gara.com',
  issuerBaseURL: 'https://dev-biswas-gara.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});