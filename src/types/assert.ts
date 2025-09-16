// Tells the compiler to restrict the type of x to T (cast/assert it for the rest of the block)
// but does not throw if this is not the case.
// The function name is capitalized to make this distinction from a traditional assert(bool) statement
export default function AssertType<T extends U, U = unknown>(
  x: U,
): asserts x is T {}
