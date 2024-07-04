export class UserHelperFunction {
  private fullname: string;

  constructor(fullname: string) {
    this.fullname = fullname;
  }

  public get fullName(): string {
    return this.fullname;
  }

  public set fullName(fullName: string) {
    const parts = fullName.split(" ");
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    this.fullname = `${firstName} ${lastName}`;
  }
}
