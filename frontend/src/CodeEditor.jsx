import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  cpp: cpp(),
};

const themeMap = {
  light: EditorView.theme({}, { dark: false }),
  'vs-dark': oneDark,
  dark: oneDark,
};

const CodeEditor = ({ initialCode = "", value, language = "javascript", onChange, theme = "light", ...props }) => {
  const [code, setCode] = useState(initialCode);

  // Use controlled value if provided
  const displayValue = value !== undefined ? value : code;

  const handleChange = (value) => {
    setCode(value);
    if (onChange) onChange(value);
  };

  return (
    <CodeMirror
      value={displayValue}
      height={props.height || "400px"}
      extensions={[languageExtensions[language] || javascript()]}
      onChange={handleChange}
      theme={themeMap[theme] || themeMap.light}
      readOnly={props.readOnly}
    />
  );
};

export default CodeEditor;