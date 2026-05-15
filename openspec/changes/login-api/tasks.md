## 1. API Contract

- [x] 1.1 Review and confirm the `/login` OpenAPI contract in `openapi/swagger.yaml`
- [x] 1.2 Create the `user-login` specification file under `openspec/changes/login-api/specs/user-login/spec.md`

## 2. Implementation

- [x] 2.1 Add or update the `POST /login` endpoint handler to accept email/password JSON requests
- [x] 2.2 Add request validation for required `email` and `password` fields
- [x] 2.3 Authenticate credentials through the existing backend auth/service layer
- [x] 2.4 Return `200` for valid credentials and `401` for invalid credentials

## 3. Testing and Verification

- [x] 3.1 Add tests for successful login with valid credentials
- [x] 3.2 Add tests for invalid login attempts and missing request fields
- [x] 3.3 Verify the new login behavior against the OpenAPI spec and documentation
