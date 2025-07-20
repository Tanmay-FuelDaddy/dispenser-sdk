import { SerialPort } from 'serialport';
import debug from 'debug';
import { getConfigFromEnv, validateTTYPath } from './envParser';

const debugLog = debug('dispenser:find-dispenser-port');

// NEW: Primary function
async function findDispenserPortInternal() {
    try {
        const config = getConfigFromEnv();
        
        // TTY Mode
        if (config.commMethod === 'TTY') {
            const ttyPath = config.ttyPath || '/dev/ttyAMA0';
            
            // Validate path
            if (!validateTTYPath(ttyPath)) {
                throw new Error(`TTY path ${ttyPath} does not exist`);
            }
            
            debugLog('Using TTY dispenser port:', ttyPath);
            return ttyPath;
        }
        
        // USB Mode
        const hardwareId = config.hardwareId;
        const attributeId = config.attributeId;
        
        if (!hardwareId || !attributeId) {
            throw new Error('USB configuration incomplete - missing hardwareId or attributeId');
        }
        
        debugLog(`Finding USB dispenser port with IDs: ${hardwareId}/${attributeId}`);
        
        const ports = await SerialPort.list();
        const foundPort = ports.find(port => 
            port.vendorId === hardwareId && 
            port.productId === attributeId
        );

        if (foundPort) {
            debugLog('Found USB dispenser port:', foundPort.path);
            return foundPort.path;
        }
        
        throw new Error(`Dispenser port not found for USB IDs: ${hardwareId}/${attributeId}`);
    } catch (error) {
        debugLog('Error finding dispenser port:', error);
        throw error;
    }
}

// NEW: Primary export (no parameters)
export async function findDispenserPort(): Promise<string> {
    return findDispenserPortInternal();
}

// DEPRECATED: Backward compatible version
export async function findDispenserPortLegacy(hardwareId: string, attributeId: string): Promise<string> {
    debugLog('DEPRECATED: findDispenserPortLegacy is obsolete and parameters are ignored');
    console.warn('DEPRECATION WARNING: findDispenserPortLegacy() is deprecated. Use findDispenserPort() instead');
    return findDispenserPortInternal();
}