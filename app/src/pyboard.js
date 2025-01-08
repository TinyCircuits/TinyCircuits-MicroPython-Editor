class Pyboard {
    constructor() {
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.inRawRepl = false;
        this.useRawPaste = true;
        this.buffer = new Uint8Array();
    }

    async connect() {
        if (this.port && this.port.readable && this.port.writable) {
            console.log('Already connected');
            return;
        }

        try {
            const filters = [{ usbVendorId: 0x2E8A, usbProductId: 0x0003 }, { usbVendorId: 0x2E8A, usbProductId: 0x0005 }];
            const ports = await navigator.serial.getPorts({ filters });
            if (ports.length > 0) {
                this.port = ports[0];
                console.log('Connecting to previously paired device...');
            } else {
                this.port = await navigator.serial.requestPort({ filters });
                console.log('Connecting to selected device...');
            }
            await this.port.open({ baudRate: 115200 });
            this.reader = this.port.readable.getReader();
            this.writer = this.port.writable.getWriter();
            this.port.addEventListener('disconnect', this.handleDisconnect.bind(this));
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    }

    handleDisconnect() {
        console.log('Device disconnected');
        this.port = null;
        this.reader = null;
        this.writer = null;
    }

    async close() {
        if (this.reader) {
            await this.reader.releaseLock();
        }
        if (this.writer) {
            await this.writer.releaseLock();
        }
        if (this.port) {
            await this.port.close();
        }
        this.port = null;
        this.reader = null;
        this.writer = null;
    }

    async readChunk() {
        const { value, done } = await this.reader.read();
        if (done) {
            console.log('Reader done');
            return null;
        }
        return value;
    }

    async readBytes(numberOfBytesToRead) {
        while (this.buffer.length < numberOfBytesToRead) {
            const chunk = await this.readChunk();
            if (chunk) {
                this.buffer = new Uint8Array([...this.buffer, ...chunk]);
            } else {
                break;
            }
        }
        const bytes = this.buffer.slice(0, numberOfBytesToRead);
        this.buffer = this.buffer.slice(numberOfBytesToRead);
        return bytes;
    }

    async readUntil(ending, timeout = 10000, dataConsumer = null) {
        let data = new Uint8Array();
        const endBytes = new TextEncoder().encode(ending);
        const startTime = Date.now();
        while (true) {
            if (Date.now() - startTime > timeout) {
                console.log('Timeout waiting for data');
                throw new Error('Timeout waiting for data');
            }

            const byte = await this.readBytes(1);
            if (byte === null) {
                break;
            }

            
            if (dataConsumer) {
                dataConsumer(byte);
                data = new Uint8Array([byte]);
            }else{
                data = new Uint8Array([...data, byte]);
            }

            if (data.length >= endBytes.length && data.slice(-endBytes.length).every((v, i) => v === endBytes[i])) {
                console.log('Ending sequence found');
                break;
            }
        }
        console.log('Final data:', new TextDecoder().decode(data));
        return data;
    }

    async enterRawRepl(softReset = true) {
        try {
            console.log('Sending Ctrl-C to interrupt any running program...');
            await this.writer.write(new TextEncoder().encode('\r\x03'));
            console.log('Flushing input...');
            while (this.reader.readable) {
                await this.reader.read();
            }
            console.log('Sending Ctrl-A to enter raw REPL...');
            await this.writer.write(new TextEncoder().encode('\r\x01'));
            if (softReset) {
                console.log('Waiting for raw REPL prompt...');
                let data = await this.readUntil('raw REPL; CTRL-B to exit\r\n>', 5000);
                let dataStr = new TextDecoder().decode(data);
                console.log('Received data:', dataStr);
                if (!dataStr.endsWith('raw REPL; CTRL-B to exit\r\n>')) {
                    console.error('Raw REPL prompt not received:', dataStr);
                    throw new Error('Could not enter raw repl');
                }
                console.log('Sending Ctrl-D for soft reset...');
                await this.writer.write(new TextEncoder().encode('\x04'));
                console.log('Waiting for soft reboot...');
                data = await this.readUntil('soft reboot\r\n', 5000);
                dataStr = new TextDecoder().decode(data);
                console.log('Received data:', dataStr);
                if (!dataStr.endsWith('soft reboot\r\n')) {
                    console.error('Soft reboot prompt not received:', dataStr);
                    throw new Error('Could not enter raw repl');
                }
            }
            console.log('Waiting for final raw REPL prompt...');
            let finalData = await this.readUntil('raw REPL; CTRL-B to exit\r\n', 5000);
            let finalDataStr = new TextDecoder().decode(finalData);
            console.log('Received data:', finalDataStr);
            if (!finalDataStr.endsWith('raw REPL; CTRL-B to exit\r\n')) {
                console.error('Final raw REPL prompt not received:', finalDataStr);
                throw new Error('Could not enter raw repl');
            }
            this.inRawRepl = true;
            console.log('Entered raw REPL mode successfully.');
        } catch (error) {
            console.error('Error entering raw REPL:', error);
            throw error;
        }
    }

    async exitRawRepl() {
        await this.writer.write(new TextEncoder().encode('\r\x02'));
        this.inRawRepl = false;
    }

    async follow(timeout = 10000, dataConsumer) {
        let data = await this.readUntil('\x04', timeout, dataConsumer);
        let dataStr = new TextDecoder().decode(data);
        if (!dataStr.endsWith('\x04')) {
            throw new Error('Timeout waiting for first EOF reception');
        }
        data = data.slice(0, -1);
        let dataErr = await this.readUntil('\x04', timeout);
        let dataErrStr = new TextDecoder().decode(dataErr);
        if (!dataErrStr.endsWith('\x04')) {
            throw new Error('Timeout waiting for second EOF reception');
        }
        dataErr = dataErr.slice(0, -1);
        return { data, dataErr };
    }

    async rawPasteWrite(commandBytes) {
        let data = await this.readBytes(2);
        let windowSize = new DataView(data.buffer).getUint16(0, true);
        let windowRemain = windowSize;
        let i = 0;
        while (i < commandBytes.length) {
            while (windowRemain === 0 || this.reader.readable) {
                data = await this.readBytes(1);
                if (data[0] === 0x01) {
                    windowRemain += windowSize;
                } else if (data[0] === 0x04) {
                    await this.writer.write(new Uint8Array([0x04]));
                    return;
                } else {
                    throw new Error(`Unexpected read during raw paste: ${data}`);
                }
            }
            let chunk = commandBytes.slice(i, Math.min(i + windowRemain, commandBytes.length));
            await this.writer.write(chunk);
            windowRemain -= chunk.length;
            i += chunk.length;
        }
        await this.writer.write(new Uint8Array([0x04]));
        data = await this.readUntil('\x04');
        let dataStr = new TextDecoder().decode(data);
        if (!dataStr.endsWith('\x04')) {
            throw new Error(`Could not complete raw paste: ${dataStr}`);
        }
    }

    async execRawNoFollow(command) {
        let commandBytes = new TextEncoder().encode(command);
        let data = await this.readUntil('>');
        let dataStr = new TextDecoder().decode(data);
        if (!dataStr.endsWith('>')) {
            throw new Error('Could not enter raw repl');
        }
        if (this.useRawPaste) {
            await this.writer.write(new Uint8Array([0x05, 0x41, 0x01]));
            data = await this.readBytes(2);
            if (data[0] === 0x52 && data[1] === 0x00) {
                // Device understood raw-paste command but doesn't support it.
            } else if (data[0] === 0x52 && data[1] === 0x01) {
                // Device supports raw-paste mode, write out the command using this mode.
                return this.rawPasteWrite(commandBytes);
            } else {
                // Device doesn't support raw-paste, fall back to normal raw REPL.
                data = await this.readUntil('w REPL; CTRL-B to exit\r\n>');
                dataStr = new TextDecoder().decode(data);
                if (!dataStr.endsWith('w REPL; CTRL-B to exit\r\n>')) {
                    console.error(dataStr);
                    throw new Error('Could not enter raw repl');
                }
            }
            this.useRawPaste = false;
        }
        for (let i = 0; i < commandBytes.length; i += 256) {
            await this.writer.write(commandBytes.slice(i, Math.min(i + 256, commandBytes.length)));
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        await this.writer.write(new Uint8Array([0x04]));
        data = await this.readUntil('OK');
        dataStr = new TextDecoder().decode(data);
        if (!dataStr.endsWith('OK')) {
            throw new Error(`Could not exec command (response: ${dataStr})`);
        }
    }

    async execRaw(command, timeout = 10000, dataConsumer) {
        await this.execRawNoFollow(command);
        return this.follow(timeout, dataConsumer);
    }

    async eval(expression, parse = false) {
        let ret;
        if (parse) {
            ret = await this.execRaw(`print(repr(${expression}))`);
            ret = new TextDecoder().decode(ret.data).trim();
            return JSON.parse(ret);
        } else {
            ret = await this.execRaw(`print(${expression})`);
            ret = new TextDecoder().decode(ret.data).trim();
            return ret;
        }
    }

    async exec(command, dataConsumer) {
        let { data, dataErr } = await this.execRaw(command, 10000, dataConsumer);
        let dataStr = new TextDecoder().decode(data);
        let dataErrStr = new TextDecoder().decode(dataErr);
        if (dataErrStr) {
            throw new Error(`Exception: ${dataErrStr}`);
        }
        return dataStr;
    }

    async execFile(filename) {
        let response = await fetch(filename);
        let pyfile = await response.text();
        return this.exec(pyfile);
    }

    async getTime() {
        let t = (await this.eval('pyb.RTC().datetime()')).slice(1, -1).split(', ');
        return parseInt(t[4]) * 3600 + parseInt(t[5]) * 60 + parseInt(t[6]);
    }

    async fsExists(src) {
        try {
            await this.exec(`import os\nos.stat('${src}')`);
            return true;
        } catch {
            return false;
        }
    }

    async fsLs(src) {
        let cmd = `import os\nfor f in os.ilistdir('${src}'):\n print('{:12} {}{}'.format(f[3] if len(f) > 3 else 0, f[0], '/' if f[1] & 0x4000 else ''))`;
        await this.exec(cmd);
    }


    parseDirectoryListing(input) {
        // Remove the surrounding brackets and split the string into individual tuples
        let tuples = input.slice(1, -1).split('),(');
        
        // Process each tuple
        let result = tuples.map(tuple => {
            // Remove any remaining parentheses and split the tuple into its components
            let parts = tuple.replace(/[\[\]\(\)]/g, '').split(',');
            
            // Extract and trim each part
            let name = parts[0].trim().replace(/^"|"$/g, '');
            let typeCode = parseInt(parts[1].trim());
            let inode = parseInt(parts[2].trim());
            let size = parseInt(parts[3].trim());
            
            // Determine the type based on the type code
            let type = typeCode === 16384 ? 'directory' : typeCode === 32768 ? 'file' : 'unknown';
            
            // Return an object with the extracted properties
            return {
                name: name,
                type: type,
                inode: inode,
                size: size
            };
        });
        
        return result;
    }


    async fsListdir(src = '') {
        let buf = '';

        const reprConsumer = (b) => {
            buf += new TextDecoder().decode(b).replace(/\x04/g, '');
        };

        const cmd = `import os\nfor f in os.ilistdir('${src}'):\n print(repr(f), end=',')`;
        try {
            buf += '[';
            await this.exec(cmd, reprConsumer);
            buf += ']';
        } catch (e) {
            throw new Error(e);
        }

        return this.parseDirectoryListing(buf);
    }

    async fsListdirRecursive(src = '') {
        let buf = '';
    
        const reprConsumer = (b) => {
            buf += new TextDecoder().decode(b).replace(/\x04/g, '');
        };
    
        const cmd = `import os\nfor f in os.ilistdir('${src}'):\n print(repr(f), end=',')`;
        try {
            buf += '[';
            await this.exec(cmd, reprConsumer);
            buf += ']';
        } catch (e) {
            throw new Error(e);
        }

    
        const items = this.parseDirectoryListing(buf);
    
        for (let item of items) {
            if (item.type === 'directory') {
                item.children = await this.fsListdirRecursive(`${src}/${item.name}`);
            }
        }
    
        return items;
    }

    async fsStat(src) {
        try {
            await this.exec(`import os`);
            return JSON.parse(await this.eval(`os.stat('${src}')`, true));
        } catch (e) {
            throw new Error(e);
        }
    }

    async fsCat(src, chunkSize = 256) {
        let cmd = `with open('${src}') as f:\n while 1:\n  b=f.read(${chunkSize})\n  if not b:break\n  print(b,end='')`;
        await this.exec(cmd);
    }

    async fsReadFile(src, chunkSize = 256) {
        let buf = '';
        let reprConsumer = (b) => {
            buf += new TextDecoder().decode(b).replace(/\x04/g, '');
        };
        let cmd = `with open('${src}', 'rb') as f:\n while 1:\n  b=f.read(${chunkSize})\n  if not b:break\n  print(b,end='')`;
        try {
            await this.exec(cmd, reprConsumer);
        } catch (e) {
            throw new Error(e);
        }
        return JSON.parse(buf);
    }

    async fsWriteFile(dest, data, chunkSize = 256) {
        await this.exec(`f=open('${dest}','wb')\nw=f.write`);
        while (data.length) {
            let chunk = data.slice(0, chunkSize);
            await this.exec(`w(${JSON.stringify(chunk)})`);
            data = data.slice(chunkSize);
        }
        await this.exec(`f.close()`);
    }

    async fsCp(src, dest, chunkSize = 256, progressCallback = null) {
        if (progressCallback) {
            let srcSize = (await this.fsStat(src)).st_size;
            let written = 0;
        }
        await this.exec(`fr=open('${src}','rb')\nr=fr.read\nfw=open('${dest}','wb')\nw=fw.write`);
        while (true) {
            let dataLen = parseInt(new TextDecoder().decode(await this.exec(`d=r(${chunkSize})\nw(d)\nprint(len(d))`)));
            if (!dataLen) break;
            if (progressCallback) {
                written += dataLen;
                progressCallback(written, srcSize);
            }
        }
        await this.exec(`fr.close()\nfw.close()`);
    }

    async fsGet(src, dest, chunkSize = 256, progressCallback = null) {
        if (progressCallback) {
            let srcSize = (await this.fsStat(src)).st_size;
            let written = 0;
        }
        await this.exec(`f=open('${src}','rb')\nr=f.read`);
        let fileHandle = await window.showSaveFilePicker({ suggestedName: dest });
        let writable = await fileHandle.createWritable();
        while (true) {
            let data = '';
            await this.exec(`print(r(${chunkSize}))`, (d) => data += new TextDecoder().decode(d));
            data = data.slice(0, -3);
            try {
                data = JSON.parse(data);
                if (!Array.isArray(data)) throw new Error('Not bytes');
            } catch (e) {
                throw new Error(`fsGet: Could not interpret received data: ${e}`);
            }
            if (!data.length) break;
            await writable.write(new Uint8Array(data));
            if (progressCallback) {
                written += data.length;
                progressCallback(written, srcSize);
            }
        }
        await writable.close();
        await this.exec(`f.close()`);
    }

    async ensureDirectoryExists(path) {
        const parts = path.split('/');
        let currentPath = '';
        for (const part of parts) {
            if (part) {
                currentPath += `/${part}`;
                try {
                    await this.exec(`import os\ntry:\n os.stat('${currentPath}')\nexcept OSError:\n os.mkdir('${currentPath}')`);
                } catch (e) {
                    // Ignore errors if the directory already exists
                }
            }
        }
    }

    async fsPut(srcData, dest, chunkSize = 256, progressCallback = null) {
        const directoryPath = dest.substring(0, dest.lastIndexOf('/'));
        await this.ensureDirectoryExists(directoryPath);

        if (progressCallback) {
            let srcSize = srcData.length;
            let written = 0;
        }
    
        await this.exec(`f=open('${dest}','wb')\nw=f.write`);
    
        let offset = 0;
        while (offset < srcData.length) {
            let chunk = srcData.slice(offset, offset + chunkSize);

            await this.exec(`w(bytearray(${JSON.stringify(Array.from(chunk))}))`);
            offset += chunkSize;
    
            if (progressCallback) {
                written += chunk.length;
                progressCallback(written, srcSize);
            }
        }
    
        await this.exec(`f.close()`);
    }

    async fsMkdir(dir) {
        await this.exec(`import os\nos.mkdir('${dir}')`);
    }

    async fsRmdir(dir) {
        await this.exec(`import os\nos.rmdir('${dir}')`);
    }

    async fsRm(src) {
        await this.exec(`import os\nos.remove('${src}')`);
    }

    async fsTouch(src) {
        await this.exec(`f=open('${src}','a')\nf.close()`);
    }
}

export default Pyboard;


// class Pyboard {
//     constructor() {
//         this.port = null;
//         this.reader = null;
//         this.writer = null;
//         this.inRawRepl = false;
//         this.useRawPaste = true;
//         this.buffer = new Uint8Array();
//     }

//     async connect() {
//         try {
//             const filters = [
//                 { usbVendorId: 0x2E8A, usbProductId: 0x0003 }, // RP2040
//                 { usbVendorId: 0x2E8A, usbProductId: 0x0005 }  // RP2350
//             ];

//             // Check if there are any previously paired devices
//             const ports = await navigator.serial.getPorts({ filters });

//             if (ports.length > 0) {
//                 // Connect to the first paired device
//                 this.port = ports[0];
//                 console.log('Connecting to previously paired device...');
//             } else {
//                 // Prompt the user to select a device
//                 this.port = await navigator.serial.requestPort({ filters });
//                 console.log('Connecting to selected device...');
//             }

//             await this.port.open({ baudRate: 115200 });
//             this.reader = this.port.readable.getReader();
//             this.writer = this.port.writable.getWriter();
//             this.port.addEventListener('disconnect', this.handleDisconnect.bind(this));
//         } catch (error) {
//             console.error('Failed to connect:', error);
//         }
//     }

//     handleDisconnect() {
//         console.log('Device disconnected');
//         this.port = null;
//         this.reader = null;
//         this.writer = null;
//     }

//     async close() {
//         if (this.reader) {
//             await this.reader.releaseLock();
//         }
//         if (this.writer) {
//             await this.writer.releaseLock();
//         }
//         if (this.port) {
//             await this.port.close();
//         }
//         this.port = null;
//         this.reader = null;
//         this.writer = null;
//     }

//     async readChunk() {
//         const { value, done } = await this.reader.read();
//         if (done) {
//             console.log('Reader done');
//             return null;
//         }
//         return value;
//     }

//     async readBytes(numberOfBytesToRead) {
//         while (this.buffer.length < numberOfBytesToRead) {
//             const chunk = await this.readChunk();
//             if (chunk) {
//                 this.buffer = new Uint8Array([...this.buffer, ...chunk]);
//             } else {
//                 break;
//             }
//         }
//         const bytes = this.buffer.slice(0, numberOfBytesToRead);
//         this.buffer = this.buffer.slice(numberOfBytesToRead);
//         return bytes;
//     }

//     async readUntil(ending, timeout = 10000) {
//         let data = new Uint8Array();
//         const endBytes = new TextEncoder().encode(ending);
//         const startTime = Date.now();

//         while (true) {
//             if (Date.now() - startTime > timeout) {
//                 console.log('Timeout waiting for data');
//                 throw new Error('Timeout waiting for data');
//             }

//             const byte = await this.readBytes(1);
//             if (byte === null) {
//                 break;
//             }

//             data = new Uint8Array([...data, byte]);
//             console.warn(new TextDecoder().decode(data));
//             console.warn("Looking for: ", ending);

//             if (data.length >= endBytes.length && data.slice(-endBytes.length).every((v, i) => v === endBytes[i])) {
//                 console.log('Ending sequence found');
//                 break;
//             }
//         }

//         console.log('Final data:', new TextDecoder().decode(data));
//         return data;
//     }

//     async enterRawRepl(softReset = true) {
//         try {
//             console.log('Sending Ctrl-C to interrupt any running program...');
//             await this.writer.write(new TextEncoder().encode('\r\x03')); // ctrl-C: interrupt any running program

//             // Flush input (without relying on serial.flushInput())
//             console.log('Flushing input...');
//             while (this.reader.readable) {
//                 await this.reader.read();
//             }

//             console.log('Sending Ctrl-A to enter raw REPL...');
//             await this.writer.write(new TextEncoder().encode('\r\x01')); // ctrl-A: enter raw REPL

//             if (softReset) {
//                 console.log('Waiting for raw REPL prompt...');
//                 let data = await this.readUntil('raw REPL; CTRL-B to exit\r\n>', 5000);
//                 let dataStr = new TextDecoder().decode(data);
//                 console.log('Received data:', dataStr);
//                 if (!dataStr.endsWith('raw REPL; CTRL-B to exit\r\n>')) {
//                     console.error('Raw REPL prompt not received:', dataStr);
//                     throw new Error('Could not enter raw repl');
//                 }

//                 console.log('Sending Ctrl-D for soft reset...');
//                 await this.writer.write(new TextEncoder().encode('\x04')); // ctrl-D: soft reset

//                 console.log('Waiting for soft reboot...');
//                 data = await this.readUntil('soft reboot\r\n', 5000);
//                 dataStr = new TextDecoder().decode(data);
//                 console.log('Received data:', dataStr);
//                 if (!dataStr.endsWith('soft reboot\r\n')) {
//                     console.error('Soft reboot prompt not received:', dataStr);
//                     throw new Error('Could not enter raw repl');
//                 }
//             }

//             console.log('Waiting for final raw REPL prompt...');
//             let finalData = await this.readUntil('raw REPL; CTRL-B to exit\r\n', 5000);
//             let finalDataStr = new TextDecoder().decode(finalData);
//             console.log('Received data:', finalDataStr);
//             if (!finalDataStr.endsWith('raw REPL; CTRL-B to exit\r\n')) {
//                 console.error('Final raw REPL prompt not received:', finalDataStr);
//                 throw new Error('Could not enter raw repl');
//             }

//             this.inRawRepl = true;
//             console.log('Entered raw REPL mode successfully.');
//         } catch (error) {
//             console.error('Error entering raw REPL:', error);
//             throw error;
//         }
//     }

//     async exitRawRepl() {
//         await this.writer.write(new TextEncoder().encode('\r\x02')); // ctrl-B: enter friendly REPL
//         this.inRawRepl = false;
//     }

//     async follow(timeout = 10000) {
//         let data = await this.readUntil('\x04', timeout);
//         let dataStr = new TextDecoder().decode(data);
//         if (!dataStr.endsWith('\x04')) {
//             throw new Error('Timeout waiting for first EOF reception');
//         }
//         data = data.slice(0, -1);

//         let dataErr = await this.readUntil('\x04', timeout);
//         let dataErrStr = new TextDecoder().decode(dataErr);
//         if (!dataErrStr.endsWith('\x04')) {
//             throw new Error('Timeout waiting for second EOF reception');
//         }
//         dataErr = dataErr.slice(0, -1);

//         return { data, dataErr };
//     }

//     async rawPasteWrite(commandBytes) {
//         let data = await this.readBytes(2);
//         let windowSize = new DataView(data.buffer).getUint16(0, true);
//         let windowRemain = windowSize;

//         let i = 0;
//         while (i < commandBytes.length) {
//             while (windowRemain === 0 || this.reader.readable) {
//                 data = await this.readBytes(1);
//                 if (data[0] === 0x01) {
//                     windowRemain += windowSize;
//                 } else if (data[0] === 0x04) {
//                     await this.writer.write(new Uint8Array([0x04]));
//                     return;
//                 } else {
//                     throw new Error(`Unexpected read during raw paste: ${data}`);
//                 }
//             }

//             let chunk = commandBytes.slice(i, Math.min(i + windowRemain, commandBytes.length));
//             await this.writer.write(chunk);
//             windowRemain -= chunk.length;
//             i += chunk.length;
//         }

//         await this.writer.write(new Uint8Array([0x04]));

//         data = await this.readUntil('\x04');
//         let dataStr = new TextDecoder().decode(data);
//         if (!dataStr.endsWith('\x04')) {
//             throw new Error(`Could not complete raw paste: ${dataStr}`);
//         }
//     }

//     async execRawNoFollow(command) {
//         let commandBytes = new TextEncoder().encode(command);

//         let data = await this.readUntil('>');
//         let dataStr = new TextDecoder().decode(data);
//         if (!dataStr.endsWith('>')) {
//             throw new Error('Could not enter raw repl');
//         }

//         if (this.useRawPaste) {
//             await this.writer.write(new Uint8Array([0x05, 0x41, 0x01]));
//             data = await this.readBytes(2);
//             if (data[0] === 0x52 && data[1] === 0x00) {
//                 // Device understood raw-paste command but doesn't support it.
//             } else if (data[0] === 0x52 && data[1] === 0x01) {
//                 return this.rawPasteWrite(commandBytes);
//             } else {
//                 data = await this.readUntil('w REPL; CTRL-B to exit\r\n>');
//                 dataStr = new TextDecoder().decode(data);
//                 if (!dataStr.endsWith('w REPL; CTRL-B to exit\r\n>')) {
//                     console.error(dataStr);
//                     throw new Error('Could not enter raw repl');
//                 }
//             }
//             this.useRawPaste = false;
//         }

//         for (let i = 0; i < commandBytes.length; i += 256) {
//             await this.writer.write(commandBytes.slice(i, Math.min(i + 256, commandBytes.length)));
//             await new Promise(resolve => setTimeout(resolve, 10));
//         }
//         await this.writer.write(new Uint8Array([0x04]));

//         data = await this.readUntil('OK');
//         dataStr = new TextDecoder().decode(data);
//         if (!dataStr.endsWith('OK')) {
//             throw new Error(`Could not exec command (response: ${dataStr})`);
//         }
//     }

//     async execRaw(command, timeout = 10000) {
//         await this.execRawNoFollow(command);
//         return this.follow(timeout);
//     }

//     async eval(expression, parse = false) {
//         let ret;
//         if (parse) {
//             ret = await this.execRaw(`print(repr(${expression}))`);
//             ret = new TextDecoder().decode(ret.data).trim();
//             return JSON.parse(ret);
//         } else {
//             ret = await this.execRaw(`print(${expression})`);
//             ret = new TextDecoder().decode(ret.data).trim();
//             return ret;
//         }
//     }

//     async exec(command) {
//         let { data, dataErr } = await this.execRaw(command);
//         let dataStr = new TextDecoder().decode(data);
//         let dataErrStr = new TextDecoder().decode(dataErr);
//         if (dataErrStr) {
//             throw new Error(`Exception: ${dataErrStr}`);
//         }
//         return dataStr;
//     }

//     async execFile(filename) {
//         let response = await fetch(filename);
//         let pyfile = await response.text();
//         return this.exec(pyfile);
//     }

//     async getTime() {
//         let t = (await this.eval('pyb.RTC().datetime()')).slice(1, -1).split(', ');
//         return parseInt(t[4]) * 3600 + parseInt(t[5]) * 60 + parseInt(t[6]);
//     }

//     async fsExists(src) {
//         try {
//             await this.exec(`import os\nos.stat('${src}')`);
//             return true;
//         } catch {
//             return false;
//         }
//     }

//     async fsLs(src) {
//         let cmd = `import os\nfor f in os.ilistdir('${src}'):\n print('{:12} {}{}'.format(f[3] if len(f) > 3 else 0, f[0], '/' if f[1] & 0x4000 else ''))`;
//         await this.exec(cmd);
//     }

//     async fsListdir(src = '') {
//         let buf = '';
    
//         console.log("### fsl1");

//         const reprConsumer = (b) => {
//             buf += new TextDecoder().decode(b).replace(/\x04/g, '');
//         };

//         console.log("### fsl2");
    
//         const cmd = `import os\nfor f in os.ilistdir('${src}'):\n print(repr(f), end=',')`;
//         try {
//             buf += '[';
//             await this.exec(cmd, reprConsumer);
//             buf += ']';
//         } catch (e) {
//             throw new Error(e);
//         }

//         console.log("### fsl3");
    
//         return JSON.parse(buf).map(f => f.length === 4 ? f : [...f, 0]);
//     }

//     async fsStat(src) {
//         try {
//             await this.exec(`import os`);
//             return JSON.parse(await this.eval(`os.stat('${src}')`, true));
//         } catch (e) {
//             throw new Error(e);
//         }
//     }

//     async fsCat(src, chunkSize = 256) {
//         let cmd = `with open('${src}') as f:\n while 1:\n  b=f.read(${chunkSize})\n  if not b:break\n  print(b,end='')`;
//         await this.exec(cmd);
//     }

//     async fsReadFile(src, chunkSize = 256) {
//         let buf = '';

//         let reprConsumer = (b) => {
//             buf += new TextDecoder().decode(b).replace(/\x04/g, '');
//         };

//         let cmd = `with open('${src}', 'rb') as f:\n while 1:\n  b=f.read(${chunkSize})\n  if not b:break\n  print(b,end='')`;
//         try {
//             await this.exec(cmd, reprConsumer);
//         } catch (e) {
//             throw new Error(e);
//         }
//         return JSON.parse(buf);
//     }

//     async fsWriteFile(dest, data, chunkSize = 256) {
//         await this.exec(`f=open('${dest}','wb')\nw=f.write`);
//         while (data.length) {
//             let chunk = data.slice(0, chunkSize);
//             await this.exec(`w(${JSON.stringify(chunk)})`);
//             data = data.slice(chunkSize);
//         }
//         await this.exec(`f.close()`);
//     }

//     async fsCp(src, dest, chunkSize = 256, progressCallback = null) {
//         if (progressCallback) {
//             let srcSize = (await this.fsStat(src)).st_size;
//             let written = 0;
//         }
//         await this.exec(`fr=open('${src}','rb')\nr=fr.read\nfw=open('${dest}','wb')\nw=fw.write`);
//         while (true) {
//             let dataLen = parseInt(new TextDecoder().decode(await this.exec(`d=r(${chunkSize})\nw(d)\nprint(len(d))`)));
//             if (!dataLen) break;
//             if (progressCallback) {
//                 written += dataLen;
//                 progressCallback(written, srcSize);
//             }
//         }
//         await this.exec(`fr.close()\nfw.close()`);
//     }

//     async fsGet(src, dest, chunkSize = 256, progressCallback = null) {
//         if (progressCallback) {
//             let srcSize = (await this.fsStat(src)).st_size;
//             let written = 0;
//         }
//         await this.exec(`f=open('${src}','rb')\nr=f.read`);
//         let fileHandle = await window.showSaveFilePicker({ suggestedName: dest });
//         let writable = await fileHandle.createWritable();
//         while (true) {
//             let data = '';
//             await this.exec(`print(r(${chunkSize}))`, (d) => data += new TextDecoder().decode(d));
//             data = data.slice(0, -3);
//             try {
//                 data = JSON.parse(data);
//                 if (!Array.isArray(data)) throw new Error('Not bytes');
//             } catch (e) {
//                 throw new Error(`fsGet: Could not interpret received data: ${e}`);
//             }
//             if (!data.length) break;
//             await writable.write(new Uint8Array(data));
//             if (progressCallback) {
//                 written += data.length;
//                 progressCallback(written, srcSize);
//             }
//         }
//         await writable.close();
//         await this.exec(`f.close()`);
//     }

//     async fsPut(src, dest, chunkSize = 256, progressCallback = null) {
//         if (progressCallback) {
//             let srcSize = (await (await fetch(src)).blob()).size;
//             let written = 0;
//         }
//         await this.exec(`f=open('${dest}','wb')\nw=f.write`);
//         let response = await fetch(src);
//         let reader = response.body.getReader();
//         while (true) {
//             let { done, value } = await reader.read();
//             if (done) break;
//             await this.exec(`w(${JSON.stringify(Array.from(value))})`);
//             if (progressCallback) {
//                 written += value.length;
//                 progressCallback(written, srcSize);
//             }
//         }
//         await this.exec(`f.close()`);
//     }

//     async fsMkdir(dir) {
//         await this.exec(`import os\nos.mkdir('${dir}')`);
//     }

//     async fsRmdir(dir) {
//         await this.exec(`import os\nos.rmdir('${dir}')`);
//     }

//     async fsRm(src) {
//         await this.exec(`import os\nos.remove('${src}')`);
//     }

//     async fsTouch(src) {
//         await this.exec(`f=open('${src}','a')\nf.close()`);
//     }
// }

// export default Pyboard;