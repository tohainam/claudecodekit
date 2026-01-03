# Claude Code Kit

> Development toolkit for Claude Code

## Purpose

Claude Code Kit provides automated workflows, intelligent orchestration, and a hybrid agent-skill architecture for software development.

## Architecture

- **3 Core Agents**: researcher, scouter, reviewer
- **Extensible Skills**: Domain knowledge with progressive disclosure
- **Workflow Engine**: Scale-adaptive routing with confirmation points
- **Brainstorm Process**: Interactive spec refinement before automation

## Directory Structure

- `.specs/` - Finalized specifications
- `.reports/` - Research/scout reports
- `.plans/` - Implementation plans
- `.state/` - Workflow state
- `rules/_global/` - Always-loaded guidelines
- `agents/` - Subagent definitions
- `skills/` - Multi-file skills
- `commands/` - Slash commands (includes workflow orchestration via `/run`)

## Key Principles

1. **Brainstorm Before Automate** - Interactive refinement before workflow execution
2. **Hierarchical Planning** - Master plan + sub-plans for complex features
3. **Document Everything** - Specs, reports, plans in designated folders
4. **Confirmation Points** - Human validation at key stages
