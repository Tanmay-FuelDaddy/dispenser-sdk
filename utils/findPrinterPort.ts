import { SerialPort } from 'serialport';
import debug from 'debug';
import { getConfigFromEnv, validateTTYPath } from './envParser';

const debugLog = debug('dispenser:find-printer-port');

// NEW: Primary function
async function findPrinterPortInternal() {
    try {
        const config = getConfigFromEnv();
        
        if (!config.printer) {
            throw new Error('Printer configuration not found');
        }
        
        // TTY Mode
        if (config.printer.commMethod === 'TTY') {
            const ttyPath = config.printer.ttyPath || '/dev/ttyAMA1';
            
            // Validate path
            if (!validateTTYPath(ttyPath)) {
                throw new Error(`TTY path ${ttyPath} does not exist`);
            }
            
            debugLog('Using TTY printer port:', ttyPath);
            return ttyPath;
        }
        
        // USB Mode
        const hardwareId = config.printer.hardwareId;
        const attributeId = config.printer.attributeId;
        
        if (!hardwareId || !attributeId) {
            throw new Error('USB printer configuration incomplete - missing hardwareId or attributeId');
        }
        
        debugLog(`Finding USB printer port with IDs: ${hardwareId}/${attributeId}`);
        
        const ports = await SerialPort.list();
        const foundPort = ports.find(port => 
            port.vendorId === hardwareId && 
            port.productId === attributeId
        );

        if (foundPort) {
            debugLog('Found USB printer port:', foundPort.path);
            return foundPort.path;
        }
        
        throw new Error(`Printer port not found for USB IDs: ${hardwareId}/${attributeId}`);
    } catch (error) {
        debugLog('Error finding printer port:', error);
        throw error;
    }
}

// NEW: Primary export (no parameters)
export async function findPrinterPort(): Promise<string> {
    return findPrinterPortInternal();
}

// DEPRECATED: Backward compatible version
export async function findPrinterPortLegacy(hardwareId: string, attributeId: string): Promise<string> {
    debugLog('DEPRECATED: findPrinterPortLegacy is obsolete and parameters are ignored');
    console.warn('DEPRECATION WARNING: findPrinterPortLegacy() is deprecated. Use findPrinterPort() instead');
    return findPrinterPortInternal();
}