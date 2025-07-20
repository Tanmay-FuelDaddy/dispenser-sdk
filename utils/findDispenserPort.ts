// modify these 
// VITE_COMM_METHOD=TTY
// VITE_DISPENSER_SERIAL=/dev/ttyAMA0


import { SerialPort } from 'serialport';
import debug from 'debug';
import { getConfigFromEnv } from './envParser';  // Import the config parser

const debugLog = debug('dispenser:find-dispenser-port');

export async function findDispenserPort() {
    try {
        // Get the complete configuration
        const config = getConfigFromEnv();
        
        // TTY Mode: Use fixed serial port path
        if (config.commMethod === 'TTY') {
            debugLog('Using TTY mode with dispenser port:', config.ttyDispenserPath);
            return config.ttyDispenserPath;
        }
        
        // USB Mode: Fall back to hardware ID detection
        const hardwareId = config.hardwareId;
        const attributeId = config.attributeId;
        
        debugLog(`Finding USB dispenser port with hardware ID: ${hardwareId}, attribute ID: ${attributeId}`);
        
        const ports = await SerialPort.list();
        const foundPort = ports.find(port => {
            return port.vendorId === hardwareId && port.productId === attributeId;
        });

        if (foundPort) {
            debugLog('Found USB dispenser port:', foundPort.path);
            return foundPort.path;
        } else {
            throw new Error(`Dispenser port not found for hardware ID: ${hardwareId}, product ID: ${attributeId}`);
        }
    } catch (error) {
        debugLog('Error finding dispenser port:', error);
        throw error;
    }
}