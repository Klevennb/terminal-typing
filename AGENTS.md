# Agent Instructions

This repository is intended to be maintained with Codex and compatible coding agents.

## Working Rules

- Read CONTEXT.md before changing domain language.
- Keep implementation changes scoped to the requested behavior.
- Prefer existing project conventions over introducing new tooling.
- Run the relevant tests or checks before finishing work.
- Do not rewrite history, delete user work, or make destructive Git changes without explicit approval.

## Project

- Name: terminal-typing
- Type: React

## React State Management Rule

Default to the smallest possible state scope.

Before introducing or modifying React state, verify the following:

- Can this state live entirely within the current component?
- Is this state only needed by one child? Pass it as props instead of lifting it.
- Is the state only derived from props or other state? Derive it during rendering instead of storing it.
- Is a Context provider actually necessary, or would prop passing be simpler?
- Is a global store truly justified by multiple unrelated consumers?

Only lift state when there is a clear architectural reason. If state is lifted, briefly explain why local state was insufficient.

Use React Context for genuinely cross-cutting, stable concerns. The app theme is one such concern and should be exposed through a focused theme Context, consumed with `useContext`, rather than a general application-state provider. Split unrelated concerns into separate contexts and keep rapidly changing challenge state local to the challenge flow.

## React Rendering Rule

Write components as pure render functions and rely on React's supported automatic optimization path when it is configured. Do not add `useMemo`, `useCallback`, or `memo` by habit; add manual memoization only when profiling demonstrates a meaningful problem or a stable identity is required for correctness at an external boundary.

Use concurrent rendering features deliberately. Use transitions or deferred values for non-urgent work that would otherwise block urgent keyboard feedback, and never defer terminal input, focus, or accessibility announcements. Avoid Effects for derived state and event handling; use Effects only to synchronize with systems outside React.

## React Architecture Rule

Keep components cohesive, composition-friendly, and aligned with the domain language in `CONTEXT.md`. Prefer a small public interface around deep scenario and scoring behavior over logic distributed through presentation components.

Evaluate Server Components only when a server-rendering React framework and a concrete server-side data or rendering need exist. This project is currently a static Vite client application, so do not introduce Server Components or a server runtime without an explicit architecture decision that preserves the static, free-hosting constraint.

## Deep Module Design Rule

Prefer deep modules with shallow interfaces, following John Ousterhout's *A Philosophy of Software Design*.

When introducing or changing a module:

- Keep its public interface substantially simpler than the behavior it encapsulates.
- Hide domain rules, state transitions, data representation, and third-party details behind that interface.
- Prefer a few cohesive operations over many narrowly exposed methods that force callers to orchestrate internals.
- Avoid pass-through methods, shallow wrappers, and layers that merely rename another interface without hiding complexity.
- Keep errors that can be handled internally out of the public contract; expose typed outcomes when callers must decide what happens next.
- Design the interface around the common use case and make the module itself absorb edge-case complexity.
- Test behavior through the public interface so internal structure can change without cascading test rewrites.

Before adding a new abstraction, explain what complexity it hides. If the interface is not simpler than the implementation it exposes, deepen the module or remove the abstraction.

## Asset Loading Rule

Treat asset loading as part of application performance:

- Import local assets through the build pipeline and provide intrinsic dimensions where applicable.
- Keep initial-route assets small and defer non-critical routes, lesson content, and media.
- Prefer text, CSS, and lightweight vector assets over large raster media when they communicate the same information.
- Measure before adding preload hints or custom caching behavior.
- Preserve useful alternative text and avoid loading decorative assets that add no learner value.

## React Error Handling Rule

Handle errors at the narrowest layer that can recover meaningfully.

- Represent expected domain failures, such as unsupported commands or incompatible bindings, as typed outcomes and learner-facing guidance rather than thrown exceptions.
- Use error boundaries around route or feature regions for unexpected rendering failures, with a keyboard-accessible recovery action.
- Validate persisted browser data at its boundary and recover safely from missing, stale, or corrupt values.
- Never swallow errors silently or expose stack traces and internal details to learners.
- Preserve focus and announce user-visible failures accessibly.

## TDD Rule

Develop behavior in vertical red-green-refactor slices. Write one failing test against a public interface, implement only enough behavior to pass it, then refactor while green. Prefer behavior-focused domain, React integration, and real-browser keyboard tests over snapshots or tests coupled to component internals.
