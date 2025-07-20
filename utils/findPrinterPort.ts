// correct these 
// VITE_COMM_METHOD=TTY
// VITE_PRINTER_SERIAL=/dev/ttyAMA1

import { SerialPort } from 'serialport';
import debug from 'debug';
import { getConfigFromEnv } from './envParser';  // Import the config parser

const debugLog = debug('dispenser:find-printer-port');

export async function findPrinterPort() {
    try {
        // Get the complete configuration
        const config = getConfigFromEnv();
        
        // Check if we have printer configuration
        if (!config.printer) {
            throw new Error('Printer configuration not found in environment');
        }
        
        // TTY Mode: Use fixed serial port path
        if (config.commMethod === 'TTY') {
            const ttyPath = config.printer.ttyPath || config.ttyPrinterPath;
            if (!ttyPath) {
                throw new Error('TTY printer path not configured');
            }
            
            debugLog('Using TTY mode with printer port:', ttyPath);
            return ttyPath;
        }
        
        // USB Mode: Fall back to hardware ID detection
        const hardwareId = config.printer.hardwareId;
        const attributeId = config.printer.attributeId;
        
        if (!hardwareId || !attributeId) {
            throw new Error('USB printer configuration incomplete - missing hardwareId or attributeId');
        }
        
        debugLog(`Finding USB printer port with hardware ID: ${hardwareId}, attribute ID: ${attributeId}`);
        
        const ports = await SerialPort.list();
        const foundPort = ports.find(port => {
            return port.vendorId === hardwareId && port.productId === attributeId;
        });

        if (foundPort) {
            debugLog('Found USB printer port:', foundPort.path);
            return foundPort.path;
        } else {
            throw new Error(`Printer port not found for hardware ID: ${hardwareId}, product ID: ${attributeId}`);
        }
    } catch (error) {
        debugLog('Error finding printer port:', error);
        throw error;
    }
}