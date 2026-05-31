# API Documentation

Base URL: `http://localhost:8000`

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## GET /health

Returns API and Gemini status plus session statistics.

**Response**

```json
{
  "status": "ok",
  "api": "running",
  "gemini": "connected | not_configured | quota_exceeded | error",
  "gemini_configured": true,
  "reviews_completed": 5,
  "recent_analyses": [
    {
      "id": "a1b2c3d4",
      "type": "review",
      "language": "python",
      "timestamp": "2026-05-30T12:00:00Z",
      "score": 72,
      "summary": "Several issues found..."
    }
  ]
}
```

## POST /review

Analyze source code for bugs, security, performance, and best practices.

**Request**

```json
{
  "language": "python",
  "code": "print('hello')"
}
```

**Response**

```json
{
  "overall_score": 85,
  "bugs": [{"title": "...", "description": "...", "severity": "medium", "line": 3}],
  "security_issues": [],
  "performance_issues": [],
  "code_smells": [],
  "best_practices": [],
  "refactored_code": "...",
  "summary": "...",
  "fallback": false,
  "message": null
}
```

When Gemini is unavailable, `fallback` is `true` and `message` explains the issue.

## POST /debug

Debug code using an error message.

**Request**

```json
{
  "language": "python",
  "code": "def f(): pass",
  "error_message": "NameError: name 'x' is not defined"
}
```

**Response**

```json
{
  "root_cause": "...",
  "explanation": "...",
  "fix_recommendation": "...",
  "corrected_code": "...",
  "fallback": false,
  "message": null
}
```
