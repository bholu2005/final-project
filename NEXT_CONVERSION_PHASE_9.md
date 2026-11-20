# Conversion Progress — Phase 9: evidence-first debugging assistant

- Added a reusable system prompt focused on evidence, hypotheses, confidence, minimal fixes, and concrete verification steps.
- User-supplied problem text, errors, and code are serialized as JSON data and explicitly treated as untrusted content.
- The worker sends this guidance consistently to Anthropic or OpenAI compatible providers and clamps the configured output token limit.

This is prompt/inference-time configuration, not model training or fine-tuning. Actual model training would require a curated, legally usable dataset, model/provider support, compute, evaluation, and a separate training/deployment workflow; this repository does not perform that. Never send secrets or private source code to a third-party provider unless authorized. Typecheck, provider integration, and end-to-end job tests still need to be run in the developer environment.
