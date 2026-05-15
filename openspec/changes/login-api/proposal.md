## Why

The project needs a formal contract for user login so the API behavior is clearly defined and implementable. This ensures authentication behavior is testable, aligned with OpenAPI documentation, and ready for implementation.

## What Changes

- Add a new `user-login` capability that describes the `/login` API endpoint.
- Define request and response requirements for email/password authentication.
- Capture success and failure behavior in a new spec file.

## Capabilities

### New Capabilities
- `user-login`: Define the login endpoint contract for authenticating users with email and password and returning the appropriate success or unauthorized responses.

### Modified Capabilities

- None

## Impact

- Affects the API contract and OpenAPI documentation.
- Introduces backend authentication behavior and request validation.
- Requires new login tests and verification of response codes.
