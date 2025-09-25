export class JsonStrategy {
  static canHandle(obj) {
    try {
      JSON.stringify(obj);
      return true;
    } catch {
      return false;
    }
  }

  static clone(obj) {
    if (!JsonStrategy.canHandle(obj)) {
      throw new Error('Object contains non-serializable values');
    }
    return JSON.parse(JSON.stringify(obj));
  }
}
