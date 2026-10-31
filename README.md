# WebRunbook

An open-source, local-first browser automation tool being designed to turn natural-language instructions into persistent, reusable workflows.

**Status: brainstorming, discovery, and architecture design.** WebRunbook is a working name. The repository currently contains the initial Nx/TypeScript workspace and the [project brief](docs/project-brief.md); the capabilities below describe the intended product. Scope, architecture, and parts of the technology stack are still open for discussion.

## The idea

Browser scripts are efficient to run but require manual creation and maintenance. AI browser agents can discover interactions dynamically, but using a model for every repeated task adds cost, latency, and variability.

WebRunbook aims to combine the two approaches:

**Use AI to discover and maintain automations. Use deterministic execution to run them.**

A user or external agent would describe a task and its target website. WebRunbook would discover the required interactions, save a structured workflow, and reuse it for subsequent runs without an LLM handling ordinary browser interactions. When a recoverable website change breaks a workflow, an AI recovery agent would propose and validate a repair before saving a new version.

## Intended workflow

1. **Describe:** provide a website, a task, and the required inputs.
2. **Discover:** use an AI agent to explore the site and generate a reusable, parameterized workflow.
3. **Validate and save:** check the workflow and persist a version for reuse.
4. **Run:** validate inputs and execute the saved workflow deterministically.
5. **Recover:** capture failures and browser state, diagnose recoverable issues, and validate candidate repairs before reuse.

The planned automation library would support multiple websites and workflows, immutable workflow versions, execution history, and repair records. Logs, traces, and screenshots would help developers inspect runs and diagnose failures.

## Initial use case: job applications

The first intended use case is assisting with job application forms. An external agent could supply application data and a resume, then ask WebRunbook to reuse or discover a workflow for a recruitment website.

The workflow would populate fields, upload the resume, validate the form, and **pause for human review and authorization before submission**. Development and automated testing would use a local mock recruitment portal.

The design must respect website permissions and applicable terms, without bypassing access controls, CAPTCHAs, or anti-bot protections. The underlying engine is intended to support browser automation beyond job applications.

## Direction and open technology choices

The current direction is a local-first developer tool, with a CLI followed by an MCP server for external agents and applications. AI operations may require model credentials or a compatible local model. OpenAI Dot is a proposed orchestration environment for the initial use case, subject to validating its integration capabilities.

The repository's existing tooling does not settle the full product stack:

| Area | Current position |
| --- | --- |
| Primary language | TypeScript, as specified in the brief and configured in the workspace |
| Workspace tooling | Nx with pnpm, already present in the repository |
| Browser automation engine | To be decided |
| AI models, providers, and agent tooling | To be decided; pluggable providers are a goal where practical |
| Persistent storage | Persistence is planned; database and storage design are undecided |
| Workflow format and recovery architecture | Still being designed |
| CLI and MCP implementation | Planned interfaces; implementation choices remain open |

The development approach is AI-assisted and specification-driven. The initial focus is practical automation and a public open-source project, with local operation independent of proprietary hosted infrastructure.

## Working with the repository

Start with the [project brief](docs/project-brief.md) for the problem, objectives, proposed behavior, and use-case boundaries. At this stage, contributions can help clarify requirements, explore tradeoffs, and validate assumptions before implementation choices are finalized.

The workspace declares `pnpm@12.16.1` as its package manager. With that version available, install the workspace dependencies:

```sh
pnpm install
```

As projects and targets are added, inspect them and run tasks through Nx:

```sh
pnpm nx show projects
pnpm nx run <project>:<target>
```

Product installation and usage instructions will follow once an executable implementation exists.
