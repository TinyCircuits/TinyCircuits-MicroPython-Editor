import { MpRawMode } from "ViperIDE/src/rawmode";


class MpRawModeOverride extends MpRawMode{

    constructor(port){
        super(port);
    }

    static async begin(port, soft_reboot=false) {
        const res = new MpRawModeOverride(port)
        await res.enterRawRepl(soft_reboot)
        try {
            await res.exec(`import sys,os`)
        } catch (err) {
            await res.end()
            throw err
        }
        return res
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

    async listDir(fn) {
        let buf = '';

        const cmd = `import os\nfor f in os.ilistdir('${fn}'):\n print(repr(f), end=',')`;
        try {
            buf += '[';
            buf += await this.exec(cmd);
            buf += ']';
        } catch (e) {
            throw new Error(e);
        }

        if(buf != "[]"){
            return this.parseDirectoryListing(buf);
        }else{
            return [];
        }
    }
}

export default MpRawModeOverride;