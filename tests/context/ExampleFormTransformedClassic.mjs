import React, { useId, useState } from "react";
function ExampleForm() {
  const id = useId(); // Generates a unique ID
  const [name, setName] = useState("");
  return /*#__PURE__*/ React.createElement(
    "div",
    null,
    /*#__PURE__*/ React.createElement(
      "label",
      {
        htmlFor: `${id}-name`,
      },
      "Enter your name:",
    ),
    /*#__PURE__*/ React.createElement("input", {
      id: `${id}-name`,
      type: "text",
      value: name,
      onChange: (e) => setName(e.target.value),
    }),
    /*#__PURE__*/ React.createElement("p", null, "Hello, ", name || "stranger", "!"),
  );
}
export default ExampleForm;
