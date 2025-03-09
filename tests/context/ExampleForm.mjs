import { useId, useState } from "react";

function ExampleForm() {
  const id = useId(); // Generates a unique ID
  const [name, setName] = useState("");

  return (
    <div>
      <label htmlFor={`${id}-name`}>Enter your name:</label>
      <input
        id={`${id}-name`}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>Hello, {name || "stranger"}!</p>
    </div>
  );
}

export default ExampleForm;
