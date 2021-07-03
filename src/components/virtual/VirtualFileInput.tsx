import React, { useRef } from "react";
import { VirtualElementProps } from "./VirtualElement";

/**
 * Passed to [[`VirtualFileInput`]]
 */
interface VirtualFileInputProps extends VirtualElementProps<HTMLInputElement> {
  /**
   * An `onChange` callback that is given the extracted `FileList` as {@param files} if and only if
   * * it exists (is non-null), and
   * * has at least one file.
   * Otherwise, it is not called.
   *
   * Use the `onChange` attribute if you instead want the raw handler
   */
  acceptFiles?: (files: FileList) => void;
}

const VirtualFileInput = ({
  acceptFiles,
  captureRef,
  ...attrs
}: VirtualFileInputProps &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >): JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  captureRef?.(fileInputRef);

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
