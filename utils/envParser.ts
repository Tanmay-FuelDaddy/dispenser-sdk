// add these VITE_COMM_METHOD=TTY
// VITE_DISPENSER_SERIAL=/dev/ttyAMA0
// VITE_PRINTER_SERIAL=/dev/ttyAMA1

import { DispenserOptions, RfidOptions } from '../main';

// New interface for extended configuration
interface ExtendedDispenserOptions extends DispenserOptions {
  commMethod?: 'USB' | 'TTY';
  ttyDispenserPath?: string;
  ttyPrinterPath?: string;
}

export function getConfigFromEnv() {
  // Determine communication method with USB default
  const commMethod: 'USB' | 'TTY' = 
    process.env.VITE_COMM_METHOD === 'TTY' ? 'TTY' : 'USB';
  
  // Get TTY paths with fallback defaults
  const ttyDispenserPath = process.env.VITE_DISPENSER_SERIAL || '/dev/ttyAMA0';
  const ttyPrinterPath = process.env.VITE_PRINTER_SERIAL || '/dev/ttyAMA1';

  // Existing configuration with new fields added
  const dispenserConfig: ExtendedDispenserOptions = {
    dispenserType: process.env.VITE_MAIN_DISPENSER_TYPE || '',
    hardwareId: process.env.VITE_MAIN_DISPENSER_HARDWARE_ID || '',
    attributeId: process.env.VITE_MAIN_DISPENSER_ATTRIBUTE_ID || '',
    baudRate: parseInt(process.env.VITE_MAIN_DISPENSER_BAUD_RATE || '0'),
    totalizerFile: process.env.VITE_MAIN_DISPENSER_TOTALIZER_FILE || 'totalizer.json',
    interByteTimeoutInterval: parseInt(process.env.VITE_MAIN_DISPENSER_INTERVAL || '300'),
    
    // New TTY configuration fields
    commMethod,
    ttyDispenserPath,
    ttyPrinterPath
  };

  // Existing K-factor handling
  if (process.env.VITE_MAIN_DISPENSER_K_FACTOR) {
    dispenserConfig.kFactor = Number(process.env.VITE_MAIN_DISPENSER_K_FACTOR);
  }

  // Printer configuration with backward compatibility
  if (process.env.VITE_MAIN_PRINTER_TYPE) {
    dispenserConfig.printer = {
      printerType: process.env.VITE_MAIN_PRINTER_TYPE,
      hardwareId: process.env.VITE_MAIN_PRINTER_HARDWARE_ID || '',
      attributeId: process.env.VITE_MAIN_PRINTER_ATTRIBUTE_ID || '',
      baudRate: parseInt(process.env.VITE_MAIN_PRINTER_BAUD_RATE || '9600'),
      
      // Add TTY path only if in TTY mode
      ...(commMethod === 'TTY' && { ttyPath: ttyPrinterPath })
    };
  }

  // Existing modbus configuration remains unchanged
  if (process.env.VITE_MAIN_MODBUS_TYPE) {
    dispenserConfig.modbus = {
      timeout: parseInt(process.env.VITE_MAIN_MODBUS_TIMEOUT || '1000'),
      deviceId: parseInt(process.env.VITE_MAIN_MODBUS_DEVICE_ID || '1'),
      overflowRegister: parseInt(process.env.VITE_MAIN_MODBUS_OVERFLOW_REGISTER || '8'),
      pulseRegister: parseInt(process.env.VITE_MAIN_MODBUS_PULSE_REGISTER || '10'),
      debug: process.env.VITE_MAIN_MODBUS_DEBUG === 'true',
    };
  }

  return dispenserConfig;
}

// RFID configuration remains unchanged
export function getRFIDConfigFromEnv(): RfidOptions {
  return {
    rfidType: process.env.VITE_MAIN_RFID_TYPE || '',
    attributeId: process.env.VITE_MAIN_RFID_ATTRIBUTE_ID || '',
    hardwareId: process.env.VITE_MAIN_RFID_HARDWARE_ID || '',
    baudRate: parseInt(process.env.VITE_MAIN_RFID_BAUD_RATE || '9600'),
    interByteTimeoutInterval: parseInt(process.env.VITE_MAIN_RFID_INTERVAL || '200'),
  } as RfidOptions;
}