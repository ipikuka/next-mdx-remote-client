import { useId, useState } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function ExampleForm() {
  const id = useId(); // Generates a unique ID
  const [name, setName] = useState("");
  return /*#__PURE__*/ _jsxs("div", {
    children: [
      /*#__PURE__*/ _jsx("label", {
        htmlFor: `${id}-name`,
        children: "Enter your name:",
      }),
      /*#__PURE__*/ _jsx("input", {
        id: `${id}-name`,
        type: "text",
        value: name,
        onChange: (e) => setName(e.target.value),
      }),
      /*#__PURE__*/ _jsxs("p", {
        children: ["Hello, ", name || "stranger", "!"],
      }),
    ],
  });
}
export default ExampleForm;
