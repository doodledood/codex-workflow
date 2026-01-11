# LLM Coding Capabilities: A Comprehensive Catalog of Strengths and Limitations

Large language models have transformed software development, yet their capabilities remain poorly understood. Research from 2024-2025 reveals a stark reality: **LLMs achieve 92% success on single-function generation but drop to just 23% on complex multi-file tasks**, with agentic tools like Devin succeeding on only **15% of real-world assignments**. This catalog synthesizes academic research, benchmark data, and practitioner experience to provide a first-principles understanding of where LLMs excel, where they fail, and why—essential knowledge for building effective agentic coding systems.

## The fundamental performance cliff exists between isolated and contextual tasks

The most important finding is the dramatic performance degradation as task complexity increases. On **HumanEval** (single-function problems), Claude 3.5 Sonnet achieves **92% success**. On **SWE-bench Verified** (curated GitHub issues requiring multi-file understanding), top models reach ~70%. But on **SWE-bench Pro** (complex, unseen industrial codebases), even the best models—GPT-5 and Claude Opus 4.1—drop to approximately **23%**. This represents a **3x performance cliff** that defines the boundary of current LLM capabilities.

The implications are profound. Most coding benchmarks test isolated, well-specified problems that don't reflect real software engineering. When models encounter unfamiliar codebases, cross-file dependencies, and implicit architectural conventions, they struggle fundamentally. Private commercial codebase evaluation shows even worse results: **14.9-17.8% success rates** on code the models haven't seen during training.

-----

## Context window degradation: The "lost in the middle" problem

### The U-shaped attention curve

Research from Liu et al. (TACL 2024) conclusively demonstrated that LLMs fail to utilize information positioned in the middle of their context windows.  Performance follows a **U-shaped curve**: highest when relevant information appears at the beginning or end, with **>20% accuracy degradation** for middle-positioned content. This phenomenon persists regardless of whether context fits within training-time limits.

The root causes are architectural. **Causal attention** means earlier tokens undergo more attention computations, biasing models toward initial content. **Rotary Position Embedding (RoPE)** introduces long-term decay effects that diminish attention to distant tokens.  Instruction fine-tuning further exacerbates the problem—models learn to weight context beginnings heavily because instructions typically appear there during training.

### Practical implications for code

The **NoLiMa benchmark** tested 12 models across context lengths: at 1K tokens, all models performed well; at 32K tokens, **11 of 12 models dropped below 50% accuracy**. Claude 3.5 Sonnet's performance on code-specific tasks drops from 29% to 3% as context scales from 10K to 1M tokens. More troubling: models with claimed 1M+ token windows often show effective utilization of only **4K-32K tokens**.

For agentic coding, this means the common approach of "loading the entire codebase into context" fundamentally doesn't work. Models cannot reliably track state across more than **5-10 variables** before exceeding working memory capacity. Cross-file reasoning degrades rapidly as file count increases, with working limits around **10 files maximum** for reliable performance.

### Needle retrieval vs. holistic understanding: The hidden performance gap

Marketing materials often cite impressive "needle-in-a-haystack" (NIAH) scores—finding a specific fact buried in long context. But this benchmark tests **lexical retrieval**, not the holistic understanding required for real coding tasks. The distinction is critical: models achieving 95%+ on vanilla NIAH often fail dramatically on synthesis tasks over the same context lengths.

**Needle tasks** (where LLMs perform well):
- Simple retrieval via pattern/lexical matching
- "Find the function named X", "What does variable Y contain?"
- Performance: 95-100% at short contexts, gradual degradation with length

**Holistic tasks** (where LLMs struggle):
- Synthesis, aggregation, reasoning across full context
- "Summarize how authentication works across these 10 files", "Count pattern occurrences", "Trace data flow end-to-end"
- Performance: Dramatic drops, especially beyond 32K tokens

**Effective context length is typically 25-50% of claimed context**:

| Model | Claimed | Effective |
|-------|---------|-----------|
| Llama 3.1 8B | 128K | 32K (25%) |
| Llama 3.1 70B | 128K | 64K (50%) |
| Most open-source models | 128K+ | <64K (<50%) |

**Practical implications**:
- Do not trust context windows at face value for synthesis tasks
- Distinguish task types: needle lookups can use full context; holistic reasoning needs chunking
- Place critical information at beginning or end, not middle
- Consider multi-agent decomposition for full-codebase reasoning

-----

## Hallucination patterns: APIs, packages, and phantom functions

### The package hallucination security threat

A University of Texas San Antonio study analyzing **576,000 code samples** across 16 LLMs found alarming hallucination rates:

- **Python**: 5.2% average hallucinated package rate
- **JavaScript**: 21.7% average hallucinated package rate
- Commercial models hallucinate **4x less** than open-source models

These hallucinations are persistent and reproducible, creating a supply chain attack vector.  Malicious actors can probe common prompts to discover frequently hallucinated package names, then register those packages with malicious implementations. The deterministic nature of LLM generation makes this attack practical at scale.

### API hallucination patterns

The **CloudAPIBench** evaluation found that API hallucinations constitute up to **15% of all hallucinations** in code LLMs. The failure modes include: inventing non-existent endpoints, providing incorrect parameters for real APIs, and using deprecated APIs that existed in training data but are now obsolete. A "snowball effect" compounds these errors—a hallucinated API call leads to hallucinated handling of its response in subsequent code.

A formal proof by Xu et al. (2024) established that **hallucination is theoretically inevitable** in LLMs. Finite information capacity and compression bounds ensure that for every model, at least one input will cause failure. This isn't an engineering problem to be solved; it's a fundamental limitation of the architecture.

-----

## Agentic coding failures: The 15% reality

### Devin: The most rigorous independent evaluation

The Answer.AI research team conducted the most comprehensive independent evaluation of Devin, testing 20 real-world tasks. Results: **3 successes, 14 failures, 3 inconclusive—a 15% success rate**.  Tasks that worked were simple integrations (Notion→Google Sheets) and basic research tasks.  Failures revealed consistent patterns:

- **Pursuing impossible solutions**: Devin spent over a day attempting to deploy apps to Railway using features that don't exist, hallucinating platform capabilities
- **Time inefficiency**: Tasks projected to take hours consumed days, with one documented case taking 6+ hours where a human completed the same work in 36 minutes
- **Overly complex solutions**: Even when simpler approaches existed, Devin produced "unusable solutions" with excessive abstraction

### The common "going off the rails" pattern

Across all agentic tools—Devin, Claude Code, Cursor, Copilot agents—a consistent failure pattern emerges:

1. Agent receives clear requirement
1. Attempts solution that partially works
1. Encounters obstacle
1. **Instead of recognizing the blocker, pursues increasingly complex workarounds**
1. Hours or days pass pursuing impossible solutions
1. Final output is overcomplicated and often unusable

This pattern explains why agentic tools show drastically different benchmark versus real-world performance. Benchmarks present clean, well-specified problems; reality presents ambiguity, edge cases, and unexpected constraints.

-----

## Where LLMs genuinely excel: The sweet spot

### High-reliability task categories (>80% success)

Despite extensive limitations, LLMs demonstrate reliable performance on specific task types:

- **Single-function code generation**: HumanEval at 92%, MBPP at ~90%
- **Boilerplate and scaffolding**: CRUD operations, API clients, configuration files
- **Unit test augmentation**: Meta's TestGen-LLM achieves 75% correct builds, with 73% of recommendations accepted for production
- **Documentation**: Up to 2x faster for README generation, code comments, API docs
- **Tool/function calling**: 90.2% on Berkeley Function-Calling Leaderboard
- **Code completion**: Single-line and multi-line suggestions with ~33% acceptance rates in production

### The optimal task characteristics

Based on research synthesis, maximum LLM effectiveness requires:

|Dimension         |Optimal Range                                |
|------------------|---------------------------------------------|
|**Size**          |Single function to single file               |
|**Scope**         |Well-defined, discrete boundaries            |
|**Complexity**    |Tasks an expert would estimate at <15 minutes|
|**Context needed**|Minimal external dependencies                |
|**Specification** |Clear, specific, with input/output examples  |

-----

## Practical implications for agentic coding systems

### Architectural recommendations

The research points to specific design principles for effective agentic coding:

1. **Task decomposition is essential**: Break complex work into <3 hour chunks. The "one-shotting" approach of attempting entire features in single passes consistently fails when context is exhausted mid-implementation.
1. **Progress tracking across context windows**: Explicit progress files to bridge context limitations.  Feature lists in structured formats (JSON) resist inappropriate modification better than prose.
1. **Explicit testing requirements**: Without forced end-to-end verification, agents mark features complete prematurely. Browser automation or other validation mechanisms must be built into workflows.
1. **Human oversight at decision points**: All major providers recommend treating agents as "junior developers who read everything but understood nothing."  Approval gates at milestones prevent cascading failures.

### Context management strategies

Given context window limitations, effective systems must:

- **Stay within 80% of theoretical context limits**—not the advertised maximum
- **Prioritize information placement**: critical instructions at beginning and end, leveraging primacy and recency bias intentionally
- **Implement intelligent chunking**: maintain explicit file references with structured labels
- **Use hybrid retrieval**: semantic embeddings combined with lexical matching reduces retrieval failures by 67%

### Error recovery patterns

Since multi-step agentic tasks have compounding failure probability, robust systems need:

- Git-based checkpointing after each successful step
- Automatic rollback on detection of divergence from goals
- State synchronization mechanisms for agent handoffs
- Maximum iteration limits (5 self-debugging attempts before escalation)

-----

## Conclusion: First principles for agentic coding effectiveness

The research reveals a clear framework for maximizing LLM effectiveness. **Task size and specification quality are the primary determinants of success**—not model capability. A well-specified single-function task will succeed at 90%+ rates across modern models; a vague multi-file feature request will fail at 70%+ rates regardless of model choice.

The fundamental insight is that **LLM capabilities are task-shaped, not capability-shaped**. Models don't have general "coding ability" that degrades gracefully; they have high competence within specific boundaries and rapid failure outside them. Effective agentic systems must be designed around these boundaries, not in the hope of transcending them.

For building agentic coding skills, this implies: decompose aggressively, specify precisely, verify continuously, and design for human oversight at every decision point. The goal is not autonomous AI coding but highly effective human-AI collaboration—leveraging LLM strengths (speed on well-defined tasks, pattern application, documentation) while preserving human judgment for architecture, ambiguity resolution, and quality assurance.
