// do not forget to add these 
// VITE_MAIN_RFID_TYPE=PETROPOINTHECTRONICS
// VITE_MAIN_RFID_HARDWARE_ID=0403
// VITE_MAIN_RFID_ATTRIBUTE_ID=6001
// VITE_MAIN_RFID_BAUD_RATE=9600

import { SerialPort } from 'serialport';
import debug from 'debug';
import { getRFIDConfigFromEnv } from './envParser';  // Import RFID config parser

const debugLog = debug('dispenser:find-rfid-port');

export async function findRfidPort() {
    try {
        // Get RFID configuration from environment
        const rfidConfig = getRFIDConfigFromEnv();
        const hardwareId = rfidConfig.hardwareId;
        const attributeId = rfidConfig.attributeId;

        // Validate configuration
        if (!hardwareId || !attributeId) {
            throw new Error('RFID configuration incomplete - missing hardwareId or attributeId');
        }

        debugLog(`Finding RFID port with hardware ID: ${hardwareId}, attribute ID: ${attributeId}`);
        
        const ports = await SerialPort.list();
        const foundPort = ports.find(port => {
            return port.vendorId === hardwareId && port.productId === attributeId;
        });

        if (foundPort) {
            debugLog('Found RFID port:', foundPort.path);
            return foundPort.path;
        } else {
            throw new Error(`RFID port not found for hardware ID: ${hardwareId}, product ID: ${attributeId}`);
        }
    } catch (error) {
        debugLog('Error finding RFID port:', error);
        throw error;
    }
}