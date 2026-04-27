export class AssessmentDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentDependencyError";
  }
}
