import { SerialPort } from 'serialport';
import debug from 'debug';
import { getRFIDConfigFromEnv, validateTTYPath } from './envParser';

const debugLog = debug('dispenser:find-rfid-port');

// NEW: Primary function
async function findRfidPortInternal() {
    try {
        const rfidConfig = getRFIDConfigFromEnv();
        
        // TTY Mode
        if (rfidConfig.commMethod === 'TTY') {
            const ttyPath = rfidConfig.ttyPath || '/dev/ttyAMA2';
            
            // Validate path
            if (!validateTTYPath(ttyPath)) {
                throw new Error(`TTY path ${ttyPath} does not exist`);
            }
            
            debugLog('Using TTY RFID port:', ttyPath);
            return ttyPath;
        }
        
        // USB Mode
        const hardwareId = rfidConfig.hardwareId;
        const attributeId = rfidConfig.attributeId;
        
        if (!hardwareId || !attributeId) {
            throw new Error('USB RFID configuration incomplete - missing hardwareId or attributeId');
        }
        
        debugLog(`Finding USB RFID port with IDs: ${hardwareId}/${attributeId}`);
        
        const ports = await SerialPort.list();
        const foundPort = ports.find(port => 
            port.vendorId === hardwareId && 
            port.productId === attributeId
        );

        if (foundPort) {
            debugLog('Found USB RFID port:', foundPort.path);
            return foundPort.path;
        }
        
        throw new Error(`RFID port not found for USB IDs: ${hardwareId}/${attributeId}`);
    } catch (error) {
        debugLog('Error finding RFID port:', error);
        throw error;
    }
}

// NEW: Primary export (no parameters)
export async function findRfidPort(): Promise<string> {
    return findRfidPortInternal();
}

// DEPRECATED: Backward compatible version
export async function findRfidPortLegacy(hardwareId: string, attributeId: string): Promise<string> {
    debugLog('DEPRECATED: findRfidPortLegacy is obsolete and parameters are ignored');
    console.warn('DEPRECATION WARNING: findRfidPortLegacy() is deprecated. Use findRfidPort() instead');
    return findRfidPortInternal();
}