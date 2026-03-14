import { defineElement, useProp, useEvent, useHost, useEffect, css } from "@sparkle/core";

const FormField = defineElement(
  {
    tag: "ec-form-field",
    props: {
      label: { type: String, value: () => "" },
      name: { type: String, value: () => "" },
      type: { type: String, value: () => "text" },
      value: { type: String, reflect: true, value: () => "" },
      rows: { type: Number, value: () => 0 },
    },
    styles: css`@unocss-placeholder
:host { @apply block; }`,
  },
  (props) => {
    const [value, setValue] = useProp<string>("value");
    const dispatch = useEvent<{ name: string; value: string }>(
      "field-change",
      { bubbles: true, composed: true },
    );
    const host = useHost();

    useEffect(() => {
      const root = host.current.shadowRoot!;
      const handler = (e: Event) => {
        const v = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
        setValue(v);
        dispatch({ name: props.name, value: v });
      };
      root.addEventListener("input", handler);
      return () => root.removeEventListener("input", handler);
    }, [props.name]);

    const cls = "w-full border border-border bg-transparent px-4 py-3 font-sans text-sm text-ink transition-colors outline-none focus:border-accent";
    const inputEl =
      props.rows > 0
        ? `<textarea data-field="${props.name}" class="${cls}" rows="${props.rows}">${value}</textarea>`
        : `<input data-field="${props.name}" type="${props.type}" value="${value}" class="${cls}" />`;

    return `
      <div>
        <label class="block font-sans text-[10px] tracking-widest uppercase text-ink-muted mb-2">${props.label}</label>
        ${inputEl}
      </div>`;
  },
);
export default FormField;
