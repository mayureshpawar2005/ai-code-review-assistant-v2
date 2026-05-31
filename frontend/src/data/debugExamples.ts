export interface DebugExample {
  id: string;
  label: string;
  language: string;
  code: string;
  errorMessage: string;
}

export const DEBUG_EXAMPLES: DebugExample[] = [
  {
    id: "python-typeerror",
    label: "Python TypeError",
    language: "python",
    code: `def greet(name):
    print("Hello, " + name)

greet(42)`,
    errorMessage:
      'TypeError: can only concatenate str (not "int") to str',
  },
  {
    id: "python-nameerror",
    label: "Python NameError",
    language: "python",
    code: `x = 10
print(y)`,
    errorMessage: "NameError: name 'y' is not defined",
  },
  {
    id: "java-null",
    label: "Java NullPointerException",
    language: "java",
    code: `public class Test {
    public static void main(String[] args) {
        String name = null;
        System.out.println(name.length());
    }
}`,
    errorMessage:
      "Exception in thread \"main\" java.lang.NullPointerException",
  },
  {
    id: "javascript-undefined",
    label: "JavaScript Undefined Error",
    language: "javascript",
    code: `function showProfile(user) {
  console.log(user.profile.name);
}

showProfile({});`,
    errorMessage:
      "TypeError: Cannot read properties of undefined (reading 'name')",
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
    errorMessage:
      "TypeError: Cannot read properties of undefined (reading 'toUpperCase')",
  },
];

export const DEFAULT_DEBUG_EXAMPLE_ID = "python-nameerror";

export function getDebugExampleById(id: string): DebugExample | undefined {
  return DEBUG_EXAMPLES.find((ex) => ex.id === id);
}

export function getDefaultDebugExample(): DebugExample {
  return getDebugExampleById(DEFAULT_DEBUG_EXAMPLE_ID) ?? DEBUG_EXAMPLES[1];
}
