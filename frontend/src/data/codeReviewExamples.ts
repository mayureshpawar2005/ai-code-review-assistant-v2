export interface CodeReviewExample {
  id: string;
  label: string;
  language: string;
  code: string;
}

export const CODE_REVIEW_EXAMPLES: CodeReviewExample[] = [
  {
    id: "python-security",
    label: "Python Security Issue",
    language: "python",
    code: `def divide(a, b):
    return a / b

password = "admin123"
result = divide(10, 0)
print(result)`,
  },
  {
    id: "javascript-async",
    label: "JavaScript Async Bug",
    language: "javascript",
    code: `async function getUser() {
  const data = fetch('/api/user');
  return data.json();
}

getUser();`,
  },
  {
    id: "java-null",
    label: "Java Null Pointer Risk",
    language: "java",
    code: `public class Test {
    public static void main(String[] args) {
        String name = null;
        System.out.println(name.length());
    }
}`,
  },
  {
    id: "typescript-api",
    label: "TypeScript API Error",
    language: "typescript",
    code: `interface User {
  name: string;
}

const user: User = {} as User;
console.log(user.name.toUpperCase());`,
  },
];

export const DEFAULT_CODE_REVIEW_EXAMPLE_ID = "python-security";

export function getExampleById(id: string): CodeReviewExample | undefined {
  return CODE_REVIEW_EXAMPLES.find((ex) => ex.id === id);
}

export function getDefaultCodeReviewExample(): CodeReviewExample {
  return (
    getExampleById(DEFAULT_CODE_REVIEW_EXAMPLE_ID) ?? CODE_REVIEW_EXAMPLES[0]
  );
}
