# Decision Records

## ADR-001: TypeScript for Both Frontend and Backend

**Date**: 2026-01-29

**Status**: Accepted

**Context**: Need to choose programming languages for the full-stack application.

**Decision**: Use TypeScript for both frontend (React) and backend (Node.js/Express).

**Consequences**:
- Consistent type system across the stack
- Reduced context switching for developers
- Better IDE support and refactoring capabilities
- Shared types between frontend and backend possible
- Slightly increased build complexity
- Need for type definitions for external libraries

---

## ADR-002: PostgreSQL as Primary Database

**Date**: 2026-01-29

**Status**: Accepted

**Context**: Need to choose a database for storing library data including users, books, loans, etc.

**Decision**: Use PostgreSQL as the primary relational database.

**Alternatives Considered**:
- MySQL: Less feature-rich, PostgreSQL has better JSON support
- MongoDB: Document model not ideal for relational data (loans, reservations)
- SQLite: Not suitable for production multi-user scenarios

**Consequences**:
- ACID compliance for transaction integrity
- Strong support for complex queries
- JSON/JSONB support for flexible data
- Excellent Sequelize ORM support
- Requires separate database server
- Slightly more complex setup than SQLite

---

## ADR-003: JWT for Authentication

**Date**: 2026-01-29

**Status**: Accepted

**Context**: Need stateless authentication mechanism for the API.

**Decision**: Use JWT with access/refresh token pattern.

**Configuration**:
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- bcrypt for password hashing (12 rounds)

**Consequences**:
- Stateless authentication (scalable)
- No server-side session storage required
- Token can be validated without database lookup
- Need to handle token refresh on client
- Cannot invalidate individual tokens (use refresh token rotation)

---

## ADR-004: Sequelize as ORM

**Date**: 2026-01-29

**Status**: Accepted

**Context**: Need an ORM for database operations.

**Decision**: Use Sequelize ORM.

**Alternatives Considered**:
- TypeORM: More TypeScript-native but less mature
- Prisma: Excellent but different paradigm
- Knex.js: Query builder, not full ORM

**Consequences**:
- Mature, well-documented ORM
- Good PostgreSQL support
- Migrations and seeders support
- Some TypeScript quirks require extra type definitions
- Parameterized queries by default (security)

---

## ADR-005: React with TanStack Query

**Date**: 2026-01-29

**Status**: Accepted

**Context**: Need frontend framework and state management solution.

**Decision**: Use React with TanStack Query for server state and Zustand for client state.

**Alternatives Considered**:
- Redux Toolkit: More boilerplate, TanStack Query handles server state better
- SWR: Similar to TanStack Query but less features
- Context API alone: Not sufficient for complex state

**Consequences**:
- Excellent caching and synchronization for server data
- Automatic refetching and stale data handling
- Lightweight client state with Zustand
- Learning curve for TanStack Query patterns

---

## ADR-006: Tailwind CSS for Styling

**Date**: 2026-01-29

**Status**: Accepted

**Context**: Need styling solution for the frontend.

**Decision**: Use Tailwind CSS.

**Alternatives Considered**:
- Material-UI: Heavier, opinionated design
- styled-components: CSS-in-JS complexity
- Plain CSS/SCSS: More maintainability issues

**Consequences**:
- Utility-first approach enables rapid development
- Consistent design system
- Smaller bundle size with purging
- HTML can become verbose
- Requires Tailwind-specific knowledge

---

## ADR-007: Docker for Deployment

**Date**: 2026-01-29

**Status**: Accepted

**Context**: Need containerization for easy deployment and portability.

**Decision**: Use Docker with Docker Compose for multi-container orchestration.

**Consequences**:
- Consistent environments across development and production
- Easy self-hosting for end users
- Simple multi-service setup (db, api, frontend)
- Requires Docker knowledge for customization
- Slightly increased complexity for simple deployments

---

## ADR-008: Rate Limiting Strategy

**Date**: 2026-01-29

**Status**: Accepted

**Context**: Need to protect API from abuse and DoS attacks.

**Decision**: Implement tiered rate limiting:
- General: 100 requests per 15 minutes per IP
- Authentication: 10 requests per 15 minutes per IP
- Strict (sensitive ops): 5 requests per minute per IP

**Consequences**:
- Protection against brute force attacks
- API stability under load
- May affect legitimate high-volume users
- Need to configure appropriately for production scale
