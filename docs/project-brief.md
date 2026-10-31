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

The engine is general-purpose. Job applications are the flagship