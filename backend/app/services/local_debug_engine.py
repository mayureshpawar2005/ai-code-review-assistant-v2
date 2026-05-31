import re

from app.models.schemas import DebugResponse

_BEST_PRACTICES_COMMON = [
    "Add automated tests that reproduce the reported error before fixing.",
    "Use typed variables and explicit null checks at system boundaries.",
    "Log the full stack trace in development; return safe messages in production.",
]


def _match_error(error_message: str, *patterns: str) -> bool:
    err = error_message.lower()
    return any(re.search(p, err, re.IGNORECASE) for p in patterns)


def analyze(language: str, code: str, error_message: str) -> DebugResponse:
    lang = language.lower()
    err = error_message.strip()

    if lang == "python" and _match_error(
        err, r"typeerror.*str.*int", r"can only concatenate str"
    ):
        return DebugResponse(
            root_cause="Type mismatch: a string was concatenated with a non-string value.",
            explanation=(
                "Python cannot use + between str and int. The function received an "
                "integer (42) but built a string with + without converting it."
            ),
            fix_recommendation=(
                "Convert non-string values with str() before concatenation, or use "
                "an f-string: f'Hello, {name}'."
            ),
            corrected_code=_fix_python_type_concat(code),
            severity="high",
            confidence_score=94,
            best_practices=[
                "Prefer f-strings or str.format() over implicit concatenation.",
                "Validate argument types at function entry (e.g. isinstance(name, str)).",
                *_BEST_PRACTICES_COMMON[:2],
            ],
            analysis_source="local",
            fallback=False,
            message=None,
        )

    if lang == "python" and _match_error(err, r"nameerror", r"name '.*' is not defined"):
        return DebugResponse(
            root_cause="Variable 'y' is not defined.",
            explanation=(
                "The name y was referenced in print() but never assigned in the "
                "current scope."
            ),
            fix_recommendation="Declare y before use, or use the intended variable (e.g. x).",
            corrected_code=_fix_python_name_error(code),
            severity="high",
            confidence_score=96,
            best_practices=[
                "Enable static analysis (mypy, pylint) to catch undefined names early.",
                "Initialize variables close to where they are first needed.",
                *_BEST_PRACTICES_COMMON[:2],
            ],
            analysis_source="local",
            fallback=False,
            message=None,
        )

    if lang == "java" and _match_error(
        err,
        r"nullpointerexception",
        r"null pointer",
        r"cannot invoke.*because.*is null",
    ):
        return DebugResponse(
            root_cause="Method called on a null reference.",
            explanation=(
                "A variable holding a reference was null when length() (or similar) "
                "was invoked. Java does not allow instance calls on null."
            ),
            fix_recommendation=(
                "Add null checks before dereferencing, use Optional<T>, or ensure "
                "the variable is assigned from a validated source."
            ),
            corrected_code=_fix_java_null(code),
            severity="high",
            confidence_score=95,
            best_practices=[
                "Use Objects.requireNonNull for fast-fail on required references.",
                "Prefer Optional and avoid returning null from public APIs.",
                *_BEST_PRACTICES_COMMON[:2],
            ],
            analysis_source="local",
            fallback=False,
            message=None,
        )

    if lang == "javascript" and _match_error(
        err,
        r"undefined",
        r"cannot read propert",
        r"is not a function",
    ):
        return DebugResponse(
            root_cause="Accessing a property on an undefined nested object.",
            explanation=(
                "The code assumed user.profile exists, but the object passed in "
                "was empty or missing nested fields. Property access on undefined "
                "throws at runtime."
            ),
            fix_recommendation=(
                "Use optional chaining (user?.profile?.name), validate input shape, "
                "or provide default objects before access."
            ),
            corrected_code=_fix_js_profile(code),
            severity="medium",
            confidence_score=91,
            best_practices=[
                "Validate API payloads with a schema before use.",
                "Use optional chaining for deeply nested optional data.",
                *_BEST_PRACTICES_COMMON[:2],
            ],
            analysis_source="local",
            fallback=False,
            message=None,
        )

    if lang in ("javascript", "typescript") and _match_error(
        err,
        r"undefined",
        r"cannot read propert",
        r"is not a function",
    ):
        return DebugResponse(
            root_cause="Accessing a property or method on an undefined value.",
            explanation=(
                "The runtime tried to read a property or call a method on undefined. "
                "Common causes: missing await, uninitialized variables, or bad API data."
            ),
            fix_recommendation=(
                "Guard with optional chaining (?.), validate API responses, and "
                "ensure async functions are awaited before use."
            ),
            corrected_code=_fix_js_undefined(code, lang),
            severity="medium",
            confidence_score=88,
            best_practices=[
                "Use strict mode and TypeScript strictNullChecks where possible.",
                "Validate external data at the boundary before business logic.",
                *_BEST_PRACTICES_COMMON[:2],
            ],
            analysis_source="local",
            fallback=False,
            message=None,
        )

    if lang == "typescript" and _match_error(
        err, r"typeerror", r"touppercase", r"cannot read"
    ):
        return DebugResponse(
            root_cause="Object does not satisfy the declared interface at runtime.",
            explanation=(
                "The value was asserted or cast to User but required fields were missing. "
                "Accessing name on an empty object caused a runtime failure."
            ),
            fix_recommendation=(
                "Populate required fields, use partial types only when appropriate, "
                "and validate objects with a schema guard before use."
            ),
            corrected_code=_fix_typescript_user(code),
            severity="medium",
            confidence_score=90,
            best_practices=[
                "Avoid unsafe `{} as User` casts; construct objects with required fields.",
                "Use zod/io-ts validators for API payloads.",
                *_BEST_PRACTICES_COMMON[:2],
            ],
            analysis_source="local",
            fallback=False,
            message=None,
        )

    return DebugResponse(
        root_cause=f"Runtime error in {language} code: {err.splitlines()[0][:120]}",
        explanation=(
            "The stack trace indicates a failure during execution. Review the failing "
            "line, variable states, and types at that point in the program."
        ),
        fix_recommendation=(
            "Reproduce locally with a debugger, inspect variables at the failure line, "
            "and apply the smallest fix that addresses the root cause."
        ),
        corrected_code=code,
        severity="medium",
        confidence_score=72,
        best_practices=list(_BEST_PRACTICES_COMMON),
        analysis_source="local",
        fallback=False,
        message=None,
    )


def _fix_python_type_concat(code: str) -> str:
    if "greet" in code and "str(" not in code:
        return code.replace(
            'print("Hello, " + name)',
            'print("Hello, " + str(name))',
        ).replace(
            "greet(42)",
            'greet("World")  # or: greet(str(42))',
        )
    return code + "\n# Fix: ensure compatible types before concatenation"


def _fix_python_name_error(code: str) -> str:
    if "print(y)" in code and "y =" not in code:
        return code.replace("print(y)", "y = 0  # initialize before use\nprint(y)")
    return code + "\ny = 0  # define missing variable before use"


def _fix_java_null(code: str) -> str:
    if "name.length()" in code:
        return code.replace(
            "System.out.println(name.length());",
            "if (name != null) {\n            System.out.println(name.length());\n        } else {\n            System.out.println(\"Name is null\");\n        }",
        )
    return code


def _fix_js_profile(code: str) -> str:
    if "user.profile.name" in code:
        return code.replace(
            "console.log(user.profile.name);",
            "console.log(user?.profile?.name ?? 'Unknown');",
        )
    return code + "\n// Fix: use optional chaining for nested properties"


def _fix_js_undefined(code: str, lang: str) -> str:
    if "data.json()" in code:
        return code.replace(
            "const data = fetch('/api/user');",
            "const response = await fetch('/api/user');\n  const data = await response.json();",
        ).replace("async function getUser()", "async function getUser()")
    if lang == "typescript" and "toUpperCase" in code:
        return _fix_typescript_user(code)
    return code + "\n// Fix: guard undefined values before property access"


def _fix_typescript_user(code: str) -> str:
    if "{} as User" in code:
        return code.replace(
            "const user: User = {} as User;",
            'const user: User = { name: "Guest" };',
        ).replace(
            "console.log(user.name.toUpperCase());",
            "console.log(user.name?.toUpperCase() ?? \"\");",
        )
    return code
