import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly secretKey = 'ExSystem_Secr3t_K3y!@#'; // In production, use environment variable

  encrypt(value: string): string {
    if (!value) return '';
    return CryptoJS.AES.encrypt(value, this.secretKey).toString();
  }

  decrypt(value: string): string {
    if (!value) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('Decryption failed', e);
      return '';
    }
  }
}
