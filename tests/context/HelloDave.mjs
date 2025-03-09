export default function HelloDave({ React }) {
  const id = React.useId();

  return "Hello Dave, your id is " + id;
}
