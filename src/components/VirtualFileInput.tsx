import React, { useRef } from "react";

/**
 * Passed to [[`VirtualFileInput`]]
 */
interface VirtualFileInputProps {
  /**
   * An `onChange` callback that is given the extracted `FileList` as {@param files} if and only if
   * * it exists (is non-null), and
   * * has at least one file.
   * Otherwise, it is not called.
   *
   * Use the `onChange` attribute if you instead want the raw handler
   */
  acceptFiles?: (files: FileList) => void;

  /**
   * Your own callback so that you can record the reference {@param ref} to the input.
   * That way, you can invoke `click()`, and therefore open the file dialog, programmatically.
   */
  captureRef?: (ref: React.RefObject<HTMLInputElement>) => void;
}

const VirtualFileInput = ({
  acceptFiles,
  captureRef,
  ...attrs
}: VirtualFileInputProps &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (fileInputRef.current) {
    captureRef?.(fileInputRef as React.RefObject<HTMLInputElement>);
  }

  return (
    <input
      onChange={
        acceptFiles === undefined
          ? undefined
          : (e) => {
              if (e.target.files?.length) acceptFiles(e.target.files);
            }
      }
      ref={fileInputRef}
      type="file"
      style={{ display: "none" }}
      {...attrs}
    />
  );
};

export default VirtualFileInput;
