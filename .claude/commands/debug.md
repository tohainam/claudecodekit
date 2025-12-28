---
description: Debug issue and find root cause (diagnosis only, no fix)
allowed-tools: Task, Read, Glob, Grep, Bash
argument-hint: <error message or issue description>
---

# Debug Issue

You are diagnosing an issue to find the root cause. This command ONLY performs diagnosis - it does not fix the issue.

## Input
Issue description: $ARGUMENTS

## Process

Use the **debugger** agent:

```
Task: Launch debugger agent
Prompt: "Diagnose this issue: $ARGUMENTS

DO NOT FIX - only investigate and report findings.

Debugging Process:

1. UNDERSTAND THE ISSUE
   - Parse the error message/description
   - Identify symptoms vs root cause
   - List reproduction steps if available

2. SEARCH CODEBASE
   - Find relevant code files
   - Search for error messages in code
   - Identify entry points and data flow

3. ANALYZE STACK TRACE (if available)
   - Trace from error to origin
   - Identify the failing line
   - Check function inputs at failure point

4. CHECK HISTORY
   - git log for recent changes to affected files
   - git blame for relevant lines
   - Look for recent commits that might have introduced the issue

5. FORM HYPOTHESIS
   - Based on evidence, what's the likely root cause?
   - What conditions trigger the issue?
   - Are there related issues in the codebase?

6. VERIFY HYPOTHESIS
   - Add temporary logging/breakpoints if needed
   - Run the code to confirm
   - Rule out alternative causes

Output Format:

# Debug Report

## Issue Summary
[Brief description of the issue]

## Symptoms
- [Observable symptom 1]
- [Observable symptom 2]

## Investigation Steps
1. [What you checked and found]
2. [What you checked and found]

## Root Cause
[Clear explanation of why the issue occurs]

Evidence:
- [File:Line] - [What it shows]
- [Git commit] - [How it relates]

## Affected Code
- [file:line] - [description]

## Suggested Fix
[Brief description of how to fix - but DO NOT implement]

## Risk Assessment
- Severity: [High/Medium/Low]
- Impact: [What's affected]
- Urgency: [How urgent is the fix]"

Subagent: debugger
```

## Output

The debug report will include:
- Root cause identified
- Evidence and analysis
- Suggested fix approach
- Risk assessment

## Next Steps

After diagnosis:
- If you want to fix: Use `/bugfix` with this diagnosis
- If you need more investigation: Provide more context
- If root cause unclear: Ask for more information
