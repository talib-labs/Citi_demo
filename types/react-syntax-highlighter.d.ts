import type React from 'react';

interface SyntaxHighlighterProps {
  language?: string;
  style?: { [key: string]: React.CSSProperties };
  children: string | string[];
  customStyle?: React.CSSProperties;
  codeTagProps?: React.HTMLProps<HTMLElement>;
  useInlineStyles?: boolean;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  wrapLongLines?: boolean;
  lineProps?: React.HTMLProps<HTMLElement>;
  PreTag?: keyof React.JSX.IntrinsicElements | React.ComponentType;
  CodeTag?: keyof React.JSX.IntrinsicElements | React.ComponentType;
  [key: string]: unknown;
}

declare module 'react-syntax-highlighter' {
  export class Prism extends React.Component<SyntaxHighlighterProps> {}
  export class PrismLight extends React.Component<SyntaxHighlighterProps> {}
  export class PrismAsync extends React.Component<SyntaxHighlighterProps> {}
  export default class SyntaxHighlighter extends React.Component<SyntaxHighlighterProps> {}
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: { [key: string]: React.CSSProperties };
  export const tomorrow: { [key: string]: React.CSSProperties };
  export const oneDark: { [key: string]: React.CSSProperties };
  export const atomDark: { [key: string]: React.CSSProperties };
}

declare module 'react-syntax-highlighter/dist/cjs/styles/prism' {
  export const vscDarkPlus: { [key: string]: React.CSSProperties };
  export const tomorrow: { [key: string]: React.CSSProperties };
}
