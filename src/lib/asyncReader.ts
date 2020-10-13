let AsyncReader;
export default AsyncReader = (file: File): Promise<FileReader> =>
  new Promise<FileReader>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
