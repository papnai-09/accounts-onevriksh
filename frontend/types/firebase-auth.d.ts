declare module "firebase/auth" {
  export class RecaptchaVerifier {
    constructor(auth: any, containerOrButton: string | HTMLElement, parameters?: any);
    clear(): void;
    render(): Promise<number>;
    verify(): Promise<string>;
  }

  export interface ConfirmationResult {
    verificationId: string;
    confirm(verificationCode: string): Promise<any>;
  }

  export function getAuth(app?: any): any;
  export function signInWithPhoneNumber(auth: any, phoneNumber: string, appVerifier: any): Promise<ConfirmationResult>;
}
