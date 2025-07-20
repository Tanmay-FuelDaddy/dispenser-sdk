

// Each device needs own type and addr
// VITE_DISPENSER_COMM_METHOD=TTY
// VITE_PRINTER_COMM_METHOD=USB
// VITE_RFID_COMM_METHOD=TTY
// VITE_DISPENSER_TTY_PATH=/dev/ttyAMA0
// VITE_RFID_TTY_PATH=/dev/ttyAMA2



import { DispenserOptions, RfidOptions } from '../main';
import fs from 'fs';

// Define communication method types
type CommMethod = 'USB' | 'TTY';

export function getConfigFromEnv() {
    // Create base config
    const dispenserConfig: DispenserOptions & {
        commMethod?: CommMethod;
        ttyPath?: string;
    } = {
        // Existing configuration
        dispenserType: process.env.VITE_MAIN_DISPENSER_TYPE || '',
        hardwareId: process.env.VITE_MAIN_DISPENSER_HARDWARE_ID || '',
        attributeId: process.env.VITE_MAIN_DISPENSER_ATTRIBUTE_ID || '',
        baudRate: parseInt(process.env.VITE_MAIN_DISPENSER_BAUD_RATE || '0'),
        totalizerFile: process.env.VITE_MAIN_DISPENSER_TOTALIZER_FILE || 'totalizer.json',
        interByteTimeoutInterval: parseInt(process.env.VITE_MAIN_DISPENSER_INTERVAL || '300'),
        
        // New per-device config
        commMethod: (process.env.VITE_DISPENSER_COMM_METHOD as CommMethod) || 'USB',
        ttyPath: process.env.VITE_DISPENSER_TTY_PATH || '/dev/ttyAMA0'
    };

    // Existing K-factor handling
    if (process.env.VITE_MAIN_DISPENSER_K_FACTOR) {
        dispenserConfig.kFactor = Number(process.env.VITE_MAIN_DISPENSER_K_FACTOR);
    }

    // Printer configuration
    if (process.env.VITE_MAIN_PRINTER_TYPE) {
        dispenserConfig.printer = {
            printerType: process.env.VITE_MAIN_PRINTER_TYPE,
            hardwareId: process.env.VITE_MAIN_PRINTER_HARDWARE_ID || '',
            attributeId: process.env.VITE_MAIN_PRINTER_ATTRIBUTE_ID || '',
            baudRate: parseInt(process.env.VITE_MAIN_PRINTER_BAUD_RATE || '9600'),
            
            // Per-device printer config
            commMethod: (process.env.VITE_PRINTER_COMM_METHOD as CommMethod) || 'USB',
            ttyPath: process.env.VITE_PRINTER_TTY_PATH || '/dev/ttyAMA1'
        };
    }

    // Modbus configuration remains unchanged
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

export function getRFIDConfigFromEnv(): RfidOptions & {
    commMethod?: CommMethod;
    ttyPath?: string;
} {
    return {
        rfidType: process.env.VITE_MAIN_RFID_TYPE || '',
        attributeId: process.env.VITE_MAIN_RFID_ATTRIBUTE_ID || '',
        hardwareId: process.env.VITE_MAIN_RFID_HARDWARE_ID || '',
        baudRate: parseInt(process.env.VITE_MAIN_RFID_BAUD_RATE || '9600'),
        interByteTimeoutInterval: parseInt(process.env.VITE_MAIN_RFID_INTERVAL || '200'),
        
        // New per-device RFID config
        commMethod: (process.env.VITE_RFID_COMM_METHOD as CommMethod) || 'USB',
        ttyPath: process.env.VITE_RFID_TTY_PATH || '/dev/ttyAMA2'
    };
}

// Utility function to check if TTY path exists
export function validateTTYPath(path: string): boolean {
    try {
        return fs.existsSync(path);
    } catch (error) {
        return false;
    }
}