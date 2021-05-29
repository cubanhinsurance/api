import { genSalt, hash } from 'bcryptjs';

export class UserDto {
  readonly name: String;
  readonly lastname: string;
  readonly email: string;
  readonly telegram_id: string;
  readonly phone_number: string;
  readonly photo: string;
  readonly username: string;
  public password: string;
  public salt: string;
  constructor(data) {
    this.username = data.username;
    this.name = data.name;
    this.lastname = data.lastname;
    this.email = data.email;
    this.telegram_id = data.telegram_id;
    this.phone_number = data.phone_number;
    this.photo =
      typeof data.photo != 'undefined' ? data.photo.toString('base64') : null;
    this.password = data.password;
  }

  async generatePassword(): Promise<UserDto> {
    const salt = await genSalt();
    const hashed = await hash(this.password, salt);
    this.password = hashed;
    this.salt = salt;
    return this;
  }
}

export class AgentDto {
  readonly role: number;
  readonly username?: string;
  readonly new_user?: UserDto;
  readonly expiration_date?: Date;
  constructor(data) {
    this.role = data.role;
    this.username = data.username;
    this.new_user = data.new_user;
  }
}

export class TechDto {
  readonly expiration_date?: Date;
  readonly username?: string;
  readonly new_user?: UserDto;
  readonly habilities: number[];
  constructor(data) {
    this.expiration_date = data.expiration_date;
    this.username = data.username;
    this.new_user = data.new_user;
    this.habilities = data.habilities;
  }
}
