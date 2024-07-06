export class UserHelperFunction {
  private firstName: string;
  private lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  public get firstname(): string {
    return this.firstName;
  }

  public get lastname(): string {
    return this.lastName;
  }

  public set capitalizeName(fullName: string) {
    const parts = fullName.split(" ");
    this.firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    this.lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
  }
}
