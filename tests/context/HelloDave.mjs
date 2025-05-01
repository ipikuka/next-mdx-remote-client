import * as ReactModule from "react";

export default function HelloDave({ runtimeProps, ...props }) {
  const { React = ReactModule } = runtimeProps;

  if (!React) return "<HelloDave /> component doesn't work due to missing `React` instance !";

  const id = React.useId();

  return React.createElement("div", props, `Hello, Dave! Your id is ${id}`);
}
