export class StructuredStrategy {
  static canHandle() {
    return typeof structuredClone !== 'undefined';
  }

  static clone(obj) {
    if (!StructuredStrategy.canHandle()) {
      throw new Error('structuredClone not available in this environment');
    }
    return structuredClone(obj);
  }
}
