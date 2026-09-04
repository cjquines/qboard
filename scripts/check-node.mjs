const minimumMajor = 24;
const currentMajor = Number.parseInt(process.versions.node, 10);

if (currentMajor < minimumMajor) {
  console.error(
    `qboard requires Node.js ${minimumMajor} or newer; found ${process.versions.node}.`,
  );
  process.exit(1);
}
