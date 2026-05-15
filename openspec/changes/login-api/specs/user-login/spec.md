## ADDED Requirements

### Requirement: Login endpoint accepts email and password
The system SHALL accept a POST request to `/login` with a JSON body containing `email` and `password`.

#### Scenario: Successful request format
- **WHEN** the client sends `POST /login` with a JSON body containing non-empty `email` and `password`
- **THEN** the request is considered valid and authentication is attempted

### Requirement: Successful login response
The system SHALL return `200` when valid credentials are provided.

#### Scenario: Valid credentials
- **WHEN** the client provides a valid `email` and matching `password`
- **THEN** the system responds with status `200` and a success payload as defined by the API contract

### Requirement: Unauthorized response for invalid credentials
The system SHALL return `401` when the credentials are invalid.

#### Scenario: Invalid credentials
- **WHEN** the client provides an incorrect `email` or `password`
- **THEN** the system responds with status `401`

### Requirement: Invalid request handling
The system SHALL reject requests that omit `email` or `password`.

#### Scenario: Missing required fields
- **WHEN** the client sends `POST /login` without `email` or `password`
- **THEN** the system responds with a validation error and does not attempt authentication
