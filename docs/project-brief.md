# Project Brief — WebRunbook

**Project name:** WebRunbook (working name, subject to change)  
**Project type:** Open-source developer tool  
**Development approach:** AI-assisted, specification-driven development  
**Primary language:** TypeScript  
**Repository:** Public GitHub repository  
**Status:** Discovery and architecture design

---

## 1. Executive Summary

WebRunbook is an open-source, AI-assisted browser automation platform that transforms natural-language instructions into persistent, reusable, and self-healing browser workflows.

Users describe an action they want to perform on a website. An AI agent explores the relevant pages, identifies the necessary interactions, and generates a structured automation workflow.

Once generated, the workflow is persisted and can be executed repeatedly through a deterministic browser automation engine without requiring AI involvement during normal execution.

When a workflow fails due to changes in website structure, navigation, or other recoverable conditions, an AI recovery agent diagnoses the issue, proposes a repair, validates the change, and updates the stored workflow.

The goal is to combine the flexibility of AI-driven browser interaction with the performance, predictability, and efficiency of traditional browser automation.

The system must operate independently as a local-first developer tool and expose capabilities through interfaces such as a CLI and Model Context Protocol (MCP).

### Core principle

**Use AI to discover and maintain automations. Use deterministic execution to run them.**

The project is not intended to become a commercial SaaS platform initially. Its primary purpose is to solve practical automation problems and demonstrate high-quality software engineering through a public open-source repository.

---

## 2. Problem Statement

Traditional website automation generally requires developers to manually inspect website elements, create browser interaction scripts, maintain selectors, and update scripts when websites change.

AI-powered browser agents can reduce the need for manually written scripts by interpreting website content and performing actions dynamically.

However, repeatedly using an AI agent to perform the same predictable task introduces unnecessary:

- LLM inference costs
- Execution latency
- Non-deterministic behaviour
- Dependency on model availability
- Opportunities for inconsistent execution

Conversely, deterministic browser scripts are efficient but often brittle when websites change.

There is an opportunity to combine both approaches.

A task should need intelligent exploration primarily during initial creation or when recovery is required. Repeated executions should reuse previously generated automation logic.

### Proposed solution

Introduce a persistent automation engine capable of:

1. Understanding a website automation task expressed in natural language.
2. Exploring the website to discover the required interactions.
3. Generating a reusable, parameterized workflow.
4. Persisting workflows and their versions.
5. Executing workflows deterministically.
6. Detecting and diagnosing execution failures.
7. Repairing recoverable failures using AI.
8. Validating and versioning repairs before reuse.
9. Exposing workflows to developers and external AI agents.

---

## 3. Project Objectives

### Primary objectives

**Natural-language workflow creation**

Allow a user or external agent to describe a task and specify its target website. The system should discover an appropriate sequence of browser interactions and generate a reusable automation.

**Deterministic workflow execution**

Previously discovered workflows should execute without requiring an LLM for ordinary browser interactions.

**Persistent automation library**

Maintain multiple websites and workflows using a persistent database. Each website may have multiple independent automations.

**Automated failure recovery**

Detect recoverable execution failures and activate an AI agent to diagnose and propose repairs.

**Workflow versioning**

Maintain immutable workflow versions, execution history, and repair records. Changes must be traceable and reversible.

**Developer-friendly interfaces**

Provide a CLI and, subsequently, an MCP server so external agents and applications can create and invoke workflows.

**Local-first operation**

The application should be installable and usable locally without requiring proprietary hosted infrastructure. AI-powered operations may require model credentials or a compatible local model.

### Secondary objectives

- Support parameterized workflow execution.
- Minimize unnecessary LLM calls.
- Allow inspection of generated workflows.
- Provide execution logs, traces, and screenshots.
- Support pluggable LLM providers where practical.
- Make workflows testable and reproducible.
- Establish a foundation for future browser automation capabilities.

---

## 4. Primary Use Case: Automated Job Applications

The initial real-world application will be automating parts of the job application process.

The intended orchestration environment is OpenAI Dot, subject to validating the required integration capabilities.

### Example scenario

An external AI agent identifies a suitable job opportunity and prepares an application using the user's supplied professional information.

The agent requests WebRunbook to complete the application form on the employer's recruitment website.

WebRunbook determines whether an applicable workflow already exists.

**If a workflow exists:**

1. Load the stored workflow.
2. Validate the supplied inputs.
3. Start an authenticated browser session where required.
4. Execute the workflow.
5. Populate the relevant application fields.
6. Upload the appropriate resume.
7. Validate the populated form.
8. Pause for human review and authorization before submission.
9. Record the result.

**If no applicable workflow exists:**

1. Launch the discovery agent.
2. Explore the relevant recruitment pages.
3. Identify the required inputs and interactions.
4. Generate a reusable workflow.
5. Validate and persist the workflow.
6. Execute the workflow using supplied application data.

**If execution fails:**

1. Capture the error and relevant browser state.
2. Determine whether the failure is recoverable.
3. Invoke the AI recovery agent when appropriate.
4. Generate a candidate repair.
5. Validate the repair without introducing unsafe side effects.
6. Resume or restart execution safely.
7. Persist the validated workflow version.

### Important boundaries

Job application websites may contain authentication, CAPTCHAs, dynamically generated fields, and anti-automation restrictions.

The platform must respect website permissions and applicable terms. It must not attempt to bypass access controls, CAPTCHAs, or anti-bot protections.

For development and automated testing, a local mock recruitment portal should be used.

The engine is general-purpose. Job applications are the flagship use case, not a hard-coded architectural dependency.

---

## 5. Functional Requirements

### FR-01 — Website registration and identification

The system must support registering and identifying target websites.

A website may contain multiple workflows and may use different page structures across subdomains, URL patterns, or application variants.

Website identity must not assume that every page on a particular domain uses an identical workflow.

### FR-02 — Workflow discovery

The system must accept:

- Target website or starting URL
- Natural-language task description
- Optional task parameters
- Optional authentication context
- Optional expected result or validation criteria

The discovery agent should inspect only the website areas necessary to perform the requested task, rather than indiscriminately analysing an entire website.

Discovery may use DOM information, accessible element properties, browser state, screenshots, and controlled navigation.

### FR-03 — Workflow generation

The system must generate a reusable automation definition containing, where applicable:

- Workflow metadata
- Input schema
- Ordered execution steps
- Element identification strategies
- Navigation instructions
- Conditional logic
- Expected outcomes
- Error-handling metadata
- Validation assertions

The preferred design direction is a structured, typed workflow representation. The final representation and execution approach require investigation.

### FR-04 — Workflow persistence

The system must persist workflows in a local database.

Each workflow should have a stable identity and support multiple immutable versions.

Users must be able to list, inspect, retrieve, and manage saved workflows.

### FR-05 — Deterministic execution

The execution engine must run stored workflows without invoking AI for each browser interaction.

Supported operations should initially include:

- Navigate
- Click
- Fill
- Select
- Upload file
- Wait for a defined condition
- Assert an expected result

Additional actions should be introduced based on demonstrated requirements.

Execution inputs must be validated before use.

### FR-06 — Failure detection and classification

The runtime must detect failures and distinguish between categories such as:

- Missing or renamed elements
- Changed navigation paths
- Timeouts
- Unexpected page states
- Authentication failures
- Business validation errors
- Ambiguous execution outcomes
- Unrecoverable or unsupported conditions

Not every failure should trigger an AI repair attempt.

### FR-07 — AI-assisted recovery

For suitable failures, the recovery agent should:

1. Analyse the failed operation.
2. Inspect the relevant browser state.
3. Compare the current page with expected workflow behaviour.
4. Identify potential causes.
5. Propose a minimally scoped repair.
6. Validate the candidate.
7. Resume execution only when safe.
8. Persist a new workflow version after successful validation.

The system must limit repair attempts and prevent uncontrolled retry loops.

### FR-08 — Execution history

Every execution must produce an auditable record containing:

- Workflow and version
- Execution identifier
- Start and completion timestamps
- Execution status
- Step-level events
- Errors and recovery attempts
- Relevant execution artifacts
- Result validation status

Sensitive inputs must not be unnecessarily recorded.

### FR-09 — Workflow version management

Workflow versions must be independently identifiable.

The system should support:

- Inspecting previous versions
- Comparing changes
- Identifying the active version
- Rolling back to a known-good version
- Associating executions with exact workflow versions

Candidate repairs must not overwrite a previously validated workflow.

### FR-10 — CLI interface

Provide a developer-friendly command-line interface for creating, listing, executing, inspecting, and managing workflows.

Illustrative commands:

```bash
webrunbook create --url <url> --task <description>

webrunbook list

webrunbook run <workflow-id> --input application.json

webrunbook history <workflow-id>

webrunbook inspect <workflow-id>
```

Final CLI syntax should be established during design.

### FR-11 — MCP integration

Expose selected capabilities through an MCP server.

Initial capabilities should include:

- Create workflow
- List workflows
- Execute workflow
- Retrieve execution status
- Inspect execution results

An external AI agent should be able to invoke a workflow without needing to understand the underlying browser automation implementation.

The integration must support long-running operations without requiring the calling agent to hold an indefinitely open request.

Compatibility with OpenAI Dot should be validated during the relevant milestone rather than assumed.

### FR-12 — Human intervention

The system must support pausing execution when human interaction is required.

Examples include:

- Authentication
- MFA challenges
- Ambiguous actions
- Final application review
- Consequential or irreversible submissions

A paused workflow should expose a meaningful status and support controlled resumption where feasible.

---

## 6. Non-Functional Requirements

### Performance and cost efficiency

Routine execution must not depend on repeated LLM calls.

The system should minimize unnecessary browser navigation, model invocations, and repeated discovery work.

Execution cost, latency, and recovery overhead should be measurable.

### Reliability

Workflows should produce consistent results under equivalent conditions.

Successful browser interactions are not sufficient evidence of successful business outcomes. Where possible, workflows should validate the resulting state.

### Safety

The system must distinguish between repeatable actions and potentially irreversible operations.

A timeout after a consequential action must not automatically result in that action being repeated.

Ambiguous outcomes should trigger verification or human intervention.

### Security

- Treat all website content as untrusted input.
- Protect authentication credentials and session data.
- Avoid storing secrets in workflow definitions.
- Prevent sensitive information from leaking into logs or model requests.
- Restrict browser and filesystem access appropriately.
- Apply explicit permissions to consequential operations.
- Avoid unrestricted execution of AI-generated code.
- Define isolation boundaries for generated workflows and browser sessions.

### Maintainability

Use a modular design with clear responsibilities and testable interfaces.

Avoid unnecessary abstractions, excessive packages, or premature infrastructure decisions.

### Extensibility

The architecture should permit additional browser capabilities, model providers, storage implementations, and external interfaces without requiring fundamental redesign.

### Developer experience

The repository should provide reproducible builds, clear documentation, automated tests, consistent tooling, and straightforward local installation.

---

## 7. Proposed Technical Foundation

The following choices are initial architectural preferences, not immutable requirements.

| Concern                    | Proposed technology                    |
| -------------------------- | -------------------------------------- |
| Language                   | TypeScript                             |
| Runtime                    | Node.js                                |
| Monorepo tooling           | Nx                                     |
| Package management         | pnpm                                   |
| Browser automation         | Playwright                             |
| AI integration             | OpenAI API with a provider abstraction |
| Database                   | SQLite                                 |
| Workflow representation    | Structured typed definitions           |
| Compilation                | TypeScript compiler initially          |
| Testing                    | Vitest and Playwright                  |
| External agent interface   | MCP                                    |
| CI/CD                      | GitHub Actions                         |
| Package release management | Nx Release                             |
| Module system              | ESM                                    |

The technical design should validate the suitability of these decisions.

### Monorepo approach

Start with a minimal Nx TypeScript workspace.

Avoid generating numerous libraries and applications before establishing their responsibilities.

Nx should manage project dependencies, builds, testing, caching, and eventual release orchestration.

pnpm will manage dependencies and workspace packages.

Use a single build strategy wherever practical. Introduce bundlers only where a concrete packaging requirement exists.

### Initial project boundaries

The first implementation should establish:

- Core workflow model and runtime
- CLI application
- Local persistence
- Browser automation adapter
- Automated testing infrastructure

AI discovery, recovery, and MCP capabilities should be added incrementally.

The exact package boundaries should be determined through architecture design, not fixed by this brief.

---

## 8. Persistence Requirements

SQLite is the preferred initial database because the tool is local-first and must support multiple persisted automations without requiring a separate database server.

The conceptual model includes the following entities.

| Entity          | Responsibility                                          |
| --------------- | ------------------------------------------------------- |
| Website         | Registered website identity and relevant URL patterns   |
| Workflow        | Stable automation identity, metadata, and configuration |
| WorkflowVersion | Immutable definition associated with a workflow         |
| Execution       | Individual workflow execution and overall result        |
| ExecutionEvent  | Step-level activity, failures, and recovery events      |
| Artifact        | Metadata and references to execution evidence           |

Structured workflow definitions may be stored as JSON documents.

Screenshots, traces, and other large binary artifacts should initially be stored on the local filesystem and referenced from the database.

Secrets and authentication data must be managed separately from ordinary workflow and execution records.

Database migrations, constraints, transaction boundaries, and version promotion rules must be considered during design.

The architecture should not introduce a generic repository framework solely to accommodate hypothetical future database providers.

---

## 9. High-Level Architecture

The system is expected to contain the following logical responsibilities.

### Discovery Agent

Interprets natural-language tasks and explores websites to identify the required interactions.

Produces a candidate reusable workflow definition.

### Workflow Model and Validation

Defines supported actions, input schemas, validation rules, and workflow invariants.

Rejects invalid or unsupported workflow definitions before execution.

### Execution Engine

Loads stored workflows, resolves input values, controls browser execution, processes steps, and verifies outcomes.

Operates independently of the AI discovery agent during normal replay.

### Recovery Agent

Investigates selected execution failures and proposes constrained changes to workflow definitions.

Produces repair evidence and candidate versions for validation.

### Persistence Layer

Manages websites, workflows, workflow versions, executions, events, and artifact references.

### CLI

Provides local developer interaction with the engine.

### MCP Server

Exposes controlled workflow capabilities to external agents and applications.

### Observability

Provides structured events, diagnostic information, traces, screenshots, and workflow execution summaries.

These are logical boundaries. They do not necessarily require separate deployable services or npm packages.

---

## 10. Architecture Decisions Requiring Investigation

The design phase must explicitly investigate the following decisions.

### ADR-001 — Workflow representation

Compare:

**Option A:** Generate executable Playwright TypeScript scripts.

**Option B:** Generate a structured workflow definition interpreted by a deterministic engine.

**Option C:** Use a hybrid representation with structured workflow steps and controlled extension mechanisms.

Evaluate flexibility, maintainability, security, reliability, repairability, testability, and implementation complexity.

Current preference: structured workflow definitions.

### ADR-002 — AI discovery approach

Compare building a discovery agent directly on Playwright against using an existing browser-agent library.

Evaluate:

- Degree of control over exploration
- Quality of discovered interactions
- Ease of generating reusable workflows
- Integration complexity
- Dependency footprint
- Model independence
- Recovery capabilities
- Long-term maintainability

Do not recreate existing agent capabilities without a clear technical reason.

### ADR-003 — Workflow execution strategy

Determine whether workflows should be interpreted directly or compiled into executable code.

Consider dynamic forms, conditional navigation, loops, data extraction, and custom actions.

### ADR-004 — Element identification strategy

Investigate robust locator representations, including accessible roles, labels, semantic relationships, DOM attributes, and fallback strategies.

Avoid fragile positional or CSS-only selectors where more reliable alternatives exist.

### ADR-005 — Recovery and validation model

Define the boundary between automatic repair, controlled retry, manual intervention, and unrecoverable failure.

Determine how repairs are verified and promoted to active versions.

### ADR-006 — Authentication and browser sessions

Determine how local browser profiles, authentication contexts, session persistence, and credentials should be managed securely.

### ADR-007 — Execution lifecycle

Investigate execution state management, cancellation, timeouts, retries, interruption recovery, and long-running operations.

Avoid introducing distributed orchestration infrastructure unless required.

### ADR-008 — Package boundaries and distribution

Determine which components should be separate libraries, which should remain internal modules, and which should be publicly published.

Optimize for maintainability and contributor experience rather than package count.

---

## 11. Development Milestones

### Milestone 1 — Foundation and deterministic execution

**Objective:** Establish a reliable local workflow engine.

Scope:

- Minimal Nx workspace
- Core workflow model
- Workflow validation
- SQLite persistence
- Playwright integration
- CLI interface
- Execution records
- Automated tests

**Acceptance criteria:**

A developer can define and persist multiple parameterized workflows for different websites, list them, and execute them repeatedly without AI involvement.

Execution outcomes and failures are recorded and available for inspection.

### Milestone 2 — AI-powered discovery

**Objective:** Generate reusable workflows from natural-language instructions.

Scope:

- Discovery agent
- Website exploration
- Element identification
- Workflow generation
- Input parameter extraction
- Candidate validation
- Workflow persistence

**Acceptance criteria:**

Given a supported website and task, the agent discovers and saves a valid workflow.

The resulting workflow can be replayed independently with different input values without repeated LLM calls.

### Milestone 3 — Self-healing and recovery

**Objective:** Recover from supported website changes.

Scope:

- Failure classification
- Diagnostic evidence capture
- AI repair proposals
- Candidate workflow versions
- Regression validation
- Safe retries and continuation
- Version promotion and rollback

**Acceptance criteria:**

A workflow is created against a controlled test website.

The test website's structure is deliberately changed.

The existing workflow detects a failure, invokes recovery, proposes and validates an appropriate repair, and executes successfully.

The original version remains available for inspection and rollback.

The test suite also verifies that unsafe or ambiguous failures do not trigger blind retries.

### Milestone 4 — MCP integration

**Objective:** Expose workflow capabilities to external AI agents.

Scope:

- MCP server
- Workflow discovery and execution tools
- Execution status retrieval
- Structured results
- Permissions and input validation
- Integration tests

**Acceptance criteria:**

An MCP-compatible client can request execution of a stored workflow, retrieve its outcome, and inspect relevant execution metadata.

OpenAI Dot compatibility is evaluated separately.

### Milestone 5 — Job application showcase

**Objective:** Demonstrate a practical end-to-end automation scenario.

Scope:

- Mock recruitment portal
- Dynamic application fields
- Resume upload
- Conditional form interactions
- Application data validation
- Human review and submission approval
- Failure and repair demonstrations

**Acceptance criteria:**

An external agent can prepare structured application information and invoke a workflow that fills a realistic job application form.

The process supports safe review before submission and records the validated outcome.

### Milestone 6 — Open-source release

**Objective:** Prepare the repository for public use and evaluation.

Scope:

- Public package distribution
- License selection
- README and installation guide
- Architecture documentation
- ADRs
- Contributor documentation
- CI and release workflows
- Example workflows
- Automated regression tests
- Benchmarks
- Demonstration video

**Acceptance criteria:**

A developer unfamiliar with the project can clone the repository, install dependencies, run tests, and reproduce a workflow creation, execution, failure, and recovery demonstration.

---

## 12. Testing and Evaluation Strategy

Testing should be treated as a foundational design concern rather than a release-stage activity.

### Unit testing

Cover workflow validation, parameter resolution, execution state transitions, recovery classification, version management, and storage operations.

### Integration testing

Use Playwright against controlled local websites.

Cover navigation, dynamic content, file uploads, selector changes, authentication state changes, and workflow persistence.

### Recovery regression testing

Create deliberate website mutations such as:

- Renamed buttons
- Changed form labels
- Reordered fields
- Added intermediate pages
- Removed elements
- Duplicate or ambiguous controls
- Changed navigation structures

Verify whether the recovery system correctly repairs, stops, or requests intervention.

### Safety testing

Test partial execution, ambiguous submission outcomes, duplicate-action prevention, secret handling, prompt-injection resistance, and permission enforcement.

### Performance evaluation

Measure:

- Deterministic workflow execution time
- Initial discovery time
- Recovery time
- LLM usage and estimated cost
- Successful replay rate
- Repair success rate
- Incorrect repair rate
- Unnecessary AI invocation rate

Benchmarks must use reproducible test cases and report actual measurements rather than assumed improvements.

---

## 13. Non-Goals for the Initial Release

The project will not initially attempt to provide:

- A commercial multi-tenant SaaS platform
- A comprehensive graphical workflow editor
- Distributed browser infrastructure
- Enterprise identity and access management
- A general-purpose desktop RPA engine
- Support for every website or interaction pattern
- CAPTCHA or anti-bot circumvention
- Autonomous irreversible actions without appropriate authorization
- Large-scale browser scraping infrastructure
- A general-purpose AI agent framework
- Automatic publishing of workflows to a public marketplace

These may be reconsidered only when justified by demonstrated use cases.

---

## 14. Open-Source and Portfolio Goals

This is intended to be a substantive engineering project, not merely an integration wrapper around existing AI libraries.

The codebase should demonstrate competence in:

- TypeScript and modern Node.js development
- Software architecture and modular design
- Browser automation
- LLM integration
- Workflow modelling and execution
- Persistence and versioning
- Failure handling and recovery
- Secure execution
- Automated testing
- MCP integration
- Engineering documentation
- Build and release automation

AI-assisted development using Codex is expected.

However, architecture decisions, acceptance criteria, quality standards, and critical validation must remain deliberate and reviewable.

The repository should make important technical decisions and their trade-offs visible through architecture documentation, ADRs, meaningful tests, and reproducible demonstrations.

---

## 15. Definition of Project Success

The project succeeds when it can reliably demonstrate this complete lifecycle:

1. A user describes a website task.
2. An AI agent discovers the required interactions.
3. The platform generates and persists a reusable workflow.
4. The workflow executes repeatedly without AI involvement.
5. A controlled website change causes an execution failure.
6. The recovery system diagnoses the failure.
7. A candidate repair is generated and validated.
8. A new workflow version is persisted.
9. The repaired workflow executes successfully.
10. Execution evidence and repair history are available for inspection.

Success also requires the system to recognize when recovery is unsafe or impossible and stop rather than produce an incorrect result.

The final system must be sufficiently modular and extensible to support workflows beyond the initial job application use case.

---

## 16. Instructions for the Architecture Design Phase

Use this brief as the authoritative statement of project intent, requirements, constraints, and success criteria.

**The next phase is architecture and technical design, not full implementation.**

The design process should:

1. Analyse the requirements and identify missing technical considerations.
2. Research relevant current libraries, frameworks, and established patterns.
3. Evaluate competing architectural approaches rather than accepting preliminary technology decisions without justification.
4. Define the major components and their responsibilities.
5. Design the workflow model and execution lifecycle.
6. Design persistence, workflow versioning, and recovery state management.
7. Define security boundaries, error handling, and validation strategies.
8. Establish the testing strategy and integration contracts.
9. Record material decisions and rejected alternatives as ADRs.
10. Produce an incremental implementation plan aligned with the milestones.

Avoid premature abstraction, unnecessary infrastructure, speculative extensibility, and excessive package decomposition.

The architecture must prioritize correctness, maintainability, reliability, security, developer experience, and ease of open-source contribution.

**Expected design deliverables:**

- Architecture overview
- Component boundaries and dependency diagram
- Workflow execution and recovery sequence diagrams
- Workflow definition schema
- Data model and persistence design
- CLI and MCP interface contracts
- Security and failure-handling design
- Testing and validation strategy
- Architecture decision records
- Milestone-aligned implementation plan
- Identified risks, assumptions, and unresolved questions

Implementation should begin only after the initial architecture and core design decisions have been reviewed.

---

**Project philosophy:** Build a dependable browser automation engine that uses AI selectively where intelligence adds value, while keeping routine execution deterministic, observable, testable, and maintainable.
